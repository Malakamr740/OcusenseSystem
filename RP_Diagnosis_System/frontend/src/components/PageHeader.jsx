import { Box, Chip, Stack, Typography } from "@mui/material";

export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  meta,
}) {
  return (
    <Stack
      direction={{ xs: "column", lg: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", lg: "flex-end" }}
      spacing={2.5}
      sx={{ mb: 3.5 }}
    >
      <Box>
        {eyebrow ? (
          <Chip
            label={eyebrow}
            color="primary"
            variant="outlined"
            sx={{ mb: 1.5, bgcolor: "white" }}
          />
        ) : null}

        <Typography variant="h4" sx={{ mb: 1 }}>
          {title}
        </Typography>

        {subtitle ? (
          <Typography color="text.secondary" sx={{ maxWidth: 860, lineHeight: 1.7 }}>
            {subtitle}
          </Typography>
        ) : null}

        {meta ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.25 }}>
            {meta}
          </Typography>
        ) : null}
      </Box>

      {actions ? <Box sx={{ width: { xs: "100%", lg: "auto" } }}>{actions}</Box> : null}
    </Stack>
  );
}