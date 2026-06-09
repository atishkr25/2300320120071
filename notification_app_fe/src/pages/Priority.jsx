import React, { useEffect, useState } from "react";
import {
  Typography,
  Grid,
  Box,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip
} from "@mui/material";

import { fetchTopPriorityNotifications } from "../utils/api";
import { Log } from "logging-middleware";

export default function PriorityInbox() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [topN, setTopN] = useState(10);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setErrorMsg(null);

      try {
        Log("frontend", "info", "page", `Fetching Priority Inbox with topN=${topN}`);
        const topNotifications = await fetchTopPriorityNotifications(topN);
        setNotifications(topNotifications);
      } catch (err) {
        Log("frontend", "error", "component", "Failed to load priority notifications");
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [topN]);

  const getColor = (t) => {
    if (t === "Placement") return "primary";
    if (t === "Result") return "secondary";
    return "default";
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Priority Inbox
      </Typography>

      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body1">Show Top:</Typography>
        <FormControl sx={{ minWidth: 100 }}>
          <Select
            value={topN}
            size="small"
            onChange={(e) => setTopN(e.target.value)}
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={15}>15</MenuItem>
            <MenuItem value={20}>20</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {errorMsg && (
        <Box sx={{ mb: 4, p: 2, bgcolor: '#ffebee', color: '#c62828', border: '1px solid #ef5350', borderRadius: 1 }}>
          <Typography variant="body1"><strong>Error fetching priority notifications:</strong> {errorMsg}</Typography>
        </Box>
      )}

      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={3}>
          {notifications.length === 0 && !errorMsg ? (
            <Grid item xs={12}>
              <Typography>No priority notifications found.</Typography>
            </Grid>
          ) : (
            notifications.map((n, index) => (
              <Grid item xs={12} md={6} key={n.ID}>
                <Card sx={{ borderLeft: '5px solid #ff9800', position: 'relative' }}>
                  <CardContent>
                    <Box sx={{ position: "absolute", top: 10, right: 10 }}>
                      <Typography variant="h6" color="text.disabled">
                        #{index + 1}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Chip label={n.Type} color={getColor(n.Type)} size="small" />
                    </Box>
                    <Typography variant="body1" sx={{ mt: 1 }}>{n.Message}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
                      {new Date(n.Timestamp).toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}
    </Box>
  );
}
