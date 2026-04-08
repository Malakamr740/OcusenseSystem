import { Avatar, Card, CardContent, Stack, Typography } from "@mui/material";

export default function StatCard({ title, value, subtitle, icon }) {
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="flex-start">
          <Stack spacing={0.75}>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h4">{value}</Typography>
            {subtitle ? (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            ) : null}
          </Stack>

          <Avatar
            sx={{
              bgcolor: "rgba(21, 94, 239, 0.08)",
              color: "primary.main",
              width: 48,
              height: 48,
            }}
          >
            {icon}
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}