import os
import re
from typing import Optional

import faiss
import pandas as pd
from rapidfuzz import process
from sentence_transformers import SentenceTransformer


DATA_PATH = "app/data/medquad.csv"
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
THRESHOLD = 0.27

eye_keywords = [
    "eye", "vision", "ocular", "ophthalmology",
    "retina", "retinal", "macula", "macular",
    "optic", "cornea", "corneal",
    "glaucoma", "cataract", "conjunctivitis",
    "keratitis", "uveitis", "blepharitis",
    "chalazion", "stye", "retinopathy",
    "retinal detachment", "macular degeneration",
    "retinoblastoma", "amblyopia", "strabismus",
    "dry eye", "photophobia", "tearing",
    "retinitis pigmentosa",
]

single_word_eye_terms = sorted({w for phrase in eye_keywords for w in phrase.split()})

greetings = ["hi", "hello", "hey", "good morning", "good evening"]
thanks_words = ["thanks", "thank you", "thx"]

QUESTION_PATTERNS = [
    r"^what is the treatment for\s+",
    r"^what is treatment for\s+",
    r"^what is the cause of\s+",
    r"^what causes\s+",
    r"^what is\s+",
    r"^treatment for\s+",
    r"^symptoms of\s+",
    r"^tell me about\s+",
    r"^explain\s+",
]

STOPWORDS = {
    "what", "is", "the", "for", "of", "a", "an", "about",
    "tell", "me", "please", "can", "you", "give", "do",
    "does", "how", "to", "and", "or", "in", "on", "with",
}

generic_followups = {
    "treatment", "treatments",
    "what is the treatment", "what are the treatments",
    "symptom", "symptoms",
    "what is the symptom", "what are the symptoms",
    "cause", "causes",
    "what is the cause", "what are the causes",
}


class EyeChatbotService:
    def __init__(self):
        self.model = None
        self.index = None
        self.questions = []
        self.answers = []
        self.is_loaded = False

        # session memory
        self.session_state: dict[int, dict] = {}

    def load(self):
        if self.is_loaded:
            return

        if not os.path.exists(DATA_PATH):
            raise FileNotFoundError(f"Chatbot dataset not found: {DATA_PATH}")

        df = pd.read_csv(DATA_PATH, engine="python", on_bad_lines="skip")
        df = df.dropna(subset=["question", "answer"])
        df = df.drop_duplicates()

        df["question"] = df["question"].apply(self.clean_text)

        focus_area_series = (
            df["focus_area"].astype(str)
            if "focus_area" in df.columns
            else pd.Series([""] * len(df))
        )

        eye_df = df[
            df["question"].apply(self.is_eye_related) |
            focus_area_series.apply(self.is_eye_related)
        ].reset_index(drop=True)

        self.questions = eye_df["question"].tolist()
        self.answers = eye_df["answer"].tolist()

        if not self.questions:
            raise ValueError("No eye-related chatbot questions were found in the dataset.")

        self.model = SentenceTransformer(MODEL_NAME)

        embeddings = self.model.encode(
            self.questions,
            convert_to_numpy=True,
            show_progress_bar=False,
        ).astype("float32")

        faiss.normalize_L2(embeddings)

        dimension = embeddings.shape[1]
        self.index = faiss.IndexFlatIP(dimension)
        self.index.add(embeddings)

        self.is_loaded = True
        print(f"Eye chatbot loaded with {len(self.questions)} QA pairs.")

    def _get_state(self, session_id: int) -> dict:
        if session_id not in self.session_state:
            self.session_state[session_id] = {
                "last_sentences": None,
                "current_position": 0,
                "last_topic_disease": None,
            }
        return self.session_state[session_id]

    @staticmethod
    def clean_text(text):
        text = str(text).lower()
        text = re.sub(r"[^\w\s]", "", text)
        text = re.sub(r"\s+", " ", text).strip()
        return text

    @staticmethod
    def is_eye_related(text):
        text = str(text).lower()
        return any(word in text for word in eye_keywords)

    @staticmethod
    def is_greeting(text):
        return any(g in text.lower() for g in greetings)

    @staticmethod
    def is_thanks(text):
        return any(t in text.lower() for t in thanks_words)

    @staticmethod
    def split_answer(text):
        return re.split(r"(?<=[.!?]) +", text)

    @staticmethod
    def extract_disease_part(user_question):
        text = EyeChatbotService.clean_text(user_question)

        for pattern in QUESTION_PATTERNS:
            new_text = re.sub(pattern, "", text).strip()
            if new_text != text:
                return new_text

        return text

    @staticmethod
    def detect_intent(original_clean: str) -> str:
        if "treatment" in original_clean or "treatments" in original_clean:
            return "treatment"
        if "symptom" in original_clean or "symptoms" in original_clean:
            return "symptoms"
        if "cause" in original_clean or "causes" in original_clean:
            return "causes"
        return "general"

    def correct_eye_keywords(self, user_question: str):
        disease_text = self.extract_disease_part(user_question)
        words = disease_text.split()

        corrected_words = []
        corrections = []

        for word in words:
            if word in STOPWORDS or len(word) < 4:
                corrected_words.append(word)
                continue

            result = process.extractOne(word, eye_keywords, score_cutoff=85)

            if result:
                match, score, _ = result
                corrected_words.append(match)
                if match != word:
                    corrections.append((word, match))
            else:
                corrected_words.append(word)

        corrected_disease = " ".join(corrected_words).strip()

        correction_message = ""
        if corrections:
            wrong, correct = corrections[0]
            correction_message = f'Did you mean "{correct}"? 👁️\n\n'

        return corrected_disease, correction_message

    def looks_eye_related(self, text: str) -> bool:
        text = self.clean_text(text)

        if not text:
            return False

        if any(keyword in text for keyword in eye_keywords):
            return True

        phrase_match = process.extractOne(text, eye_keywords, score_cutoff=70)
        if phrase_match:
            return True

        for word in text.split():
            if len(word) < 4:
                continue
            result = process.extractOne(word, single_word_eye_terms, score_cutoff=75)
            if result:
                return True

        return False

    def build_query_candidates(
        self,
        intent: str,
        disease_text: str,
        original_clean: str,
        use_previous_topic: bool,
    ) -> list[str]:
        candidates = []

        def add_candidate(q: str):
            q = self.clean_text(q)
            if q and q not in candidates:
                candidates.append(q)

        add_candidate(disease_text)

        if not use_previous_topic and original_clean not in generic_followups:
            add_candidate(original_clean)

        if intent == "treatment":
            add_candidate(f"treatment for {disease_text}")
            add_candidate(f"what is the treatment for {disease_text}")
            add_candidate(f"what are the treatments for {disease_text}")
            add_candidate(f"treatments of {disease_text}")
        elif intent == "symptoms":
            add_candidate(f"symptoms of {disease_text}")
            add_candidate(f"what are the symptoms of {disease_text}")
            add_candidate(f"symptoms for {disease_text}")
        elif intent == "causes":
            add_candidate(f"cause of {disease_text}")
            add_candidate(f"causes of {disease_text}")
            add_candidate(f"what causes {disease_text}")
        else:
            add_candidate(f"what is {disease_text}")
            add_candidate(f"what are {disease_text}")

        return candidates

    def get_reply(self, session_id: int, user_question: str) -> Optional[dict]:
        self.load()
        state = self._get_state(session_id)

        if self.is_greeting(user_question):
            return {
                "reply": "Hello! 👋 I'm your Eye Health Assistant.",
                "confidence": 1.0,
                "source_question": None,
            }

        if self.is_thanks(user_question):
            return {
                "reply": "You're welcome 😊",
                "confidence": 1.0,
                "source_question": None,
            }

        if "more" in user_question.lower() or "continue" in user_question.lower():
            if state["last_sentences"] is None:
                return {
                    "reply": "There is no previous answer to continue.",
                    "confidence": 1.0,
                    "source_question": None,
                }

            next_part = state["last_sentences"][state["current_position"]:state["current_position"] + 2]
            state["current_position"] += 2

            if not next_part:
                return {
                    "reply": "That's all the information I have about this topic.",
                    "confidence": 1.0,
                    "source_question": None,
                }

            return {
                "reply": " ".join(next_part),
                "confidence": 1.0,
                "source_question": None,
            }

        original_clean = self.clean_text(user_question)
        intent = self.detect_intent(original_clean)

        disease_text = original_clean
        prefixes = [
            r"^what are the treatments for\s+",
            r"^what is the treatment for\s+",
            r"^what are treatments for\s+",
            r"^what is treatment for\s+",
            r"^treatments for\s+",
            r"^treatment for\s+",
            r"^what are the treatments of\s+",
            r"^what is the treatment of\s+",
            r"^treatments of\s+",
            r"^treatment of\s+",
            r"^what are the symptoms of\s+",
            r"^what is the symptoms of\s+",
            r"^what are symptoms of\s+",
            r"^symptoms of\s+",
            r"^symptoms for\s+",
            r"^what causes\s+",
            r"^what is the cause of\s+",
            r"^what are the causes of\s+",
            r"^causes of\s+",
            r"^cause of\s+",
            r"^what is\s+",
            r"^what are\s+",
            r"^tell me about\s+",
            r"^explain\s+",
            r"^define\s+",
        ]

        for pattern in prefixes:
            new_text = re.sub(pattern, "", disease_text).strip()
            if new_text != disease_text:
                disease_text = new_text
                break

        use_previous_topic = False
        if disease_text == "" or disease_text in generic_followups:
            if state["last_topic_disease"] is not None:
                disease_text = state["last_topic_disease"]
                use_previous_topic = True

        correction_message = ""
        corrected_question = disease_text

        if disease_text:
            corrected_question, correction_message = self.correct_eye_keywords(disease_text)

        if use_previous_topic:
            correction_message = ""

        disease_for_search = corrected_question if corrected_question else disease_text

        if not self.looks_eye_related(disease_for_search):
            return {
                "reply": "Sorry, I could not find a confident eye-related answer.",
                "confidence": 0.0,
                "source_question": None,
            }

        query_candidates = self.build_query_candidates(
            intent=intent,
            disease_text=disease_for_search,
            original_clean=original_clean,
            use_previous_topic=use_previous_topic,
        )

        best_score = -1.0
        best_answer = None
        best_question = None

        for query_text in query_candidates:
            query_vector = self.model.encode(
                [query_text],
                convert_to_numpy=True,
                show_progress_bar=False,
            ).astype("float32")

            faiss.normalize_L2(query_vector)

            distances, indices = self.index.search(query_vector, 3)

            score = float(distances[0][0])
            idx = int(indices[0][0])
            answer = self.answers[idx]
            question = self.questions[idx]

            if score > best_score:
                best_score = score
                best_answer = answer
                best_question = question

        if best_score < THRESHOLD or best_answer is None:
            return {
                "reply": "Sorry, I could not find a confident eye-related answer.",
                "confidence": float(best_score if best_score > 0 else 0.0),
                "source_question": None,
            }

        state["last_topic_disease"] = disease_for_search
        state["last_sentences"] = self.split_answer(best_answer)
        state["current_position"] = 2

        first_part = state["last_sentences"][:2]

        reply = f"""{correction_message}Here is a quick explanation 👁️

{' '.join(first_part)}

Say "more" if you'd like me to continue.
"""

        return {
            "reply": reply,
            "confidence": float(best_score),
            "source_question": best_question,
            "full_answer": best_answer,
            "sentences": state["last_sentences"],
            "intent": intent,
            "topic": disease_for_search,
        }


chatbot_service = EyeChatbotService()