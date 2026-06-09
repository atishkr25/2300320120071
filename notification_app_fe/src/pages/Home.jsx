import React, { useEffect, useState } from "react";
import {
  Typography,
  Grid,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Card,
  CardContent,
  Chip
} from "@mui/material";

import { fetchNotifications } from "../utils/api";
import { Log } from "logging-middleware";

export default function Home() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [type, setType] = useState("");

  const [viewedIds, setViewedIds] = useState(new Set());

  // Load viewed from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("viewed_notifications");
      if (stored) {
        setViewedIds(new Set(JSON.parse(stored)));
      }
    } catch(e) {
      console.log(e);
    }
  }, []);

  useEffect(() => {
    let cancelTimer;

    async function loadData() {
      setLoading(true);
      setErrorMsg(null);
      
      try {
        Log("frontend", "info", "page", `Fetching notifications: limit=${limit}, page=${page}, type=${type}`);
        
        const params = { limit, page };
        if (type) params.notification_type = type;
        
        const data = await fetchNotifications(params);
        setNotifications(data);
        
        // Mark as viewed after 3 seconds
        cancelTimer = setTimeout(() => {
          setViewedIds((prev) => {
            const next = new Set(prev);
            let changed = false;
            data.forEach((n) => {
              if (!next.has(n.ID)) {
                next.add(n.ID);
                changed = true;
              }
            });
            if (changed) {
              localStorage.setItem("viewed_notifications", JSON.stringify(Array.from(next)));
            }
            return next;
          });
        }, 3000);

      } catch (err) {
        Log("frontend", "error", "component", "Failed to fetch notifications on Home page");
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();

    return () => {
      if (cancelTimer) clearTimeout(cancelTimer);
    };
  }, [limit, page, type]);

  const getColor = (t) => {
    if (t === "Placement") return "primary";
    if (t === "Result") return "secondary";
    return "default";
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        All Notifications
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 4, alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={type}
            label="Type"
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Event">Event</MenuItem>
            <MenuItem value="Result">Result</MenuItem>
            <MenuItem value="Placement">Placement</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Limit</InputLabel>
          <Select
            value={limit}
            label="Limit"
            onChange={(e) => {
              setLimit(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {errorMsg && (
        <Box sx={{ mb: 4, p: 2, bgcolor: '#ffebee', color: '#c62828', border: '1px solid #ef5350', borderRadius: 1 }}>
          <Typography variant="body1"><strong>Error fetching notifications:</strong> {errorMsg}</Typography>
        </Box>
      )}

      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={3}>
          {notifications.length === 0 ? (
            <Grid item xs={12}>
              <Typography>No notifications found.</Typography>
            </Grid>
          ) : (
            notifications.map((n) => {
              const isNew = !viewedIds.has(n.ID);
              return (
                <Grid item xs={12} md={6} key={n.ID}>
                  <Card sx={{ borderLeft: isNew ? '5px solid #1976d2' : '1px solid #ddd', opacity: isNew ? 1 : 0.7 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Chip label={n.Type} color={getColor(n.Type)} size="small" />
                        {isNew && <Chip label="New" color="error" size="small" variant="outlined" />}
                      </Box>
                      <Typography variant="body1" sx={{ mt: 1 }}>{n.Message}</Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
                        {new Date(n.Timestamp).toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })
          )}
        </Grid>
      )}

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Pagination 
          count={10} 
          page={page} 
          onChange={(e, val) => setPage(val)} 
          color="primary" 
        />
      </Box>
    </Box>
  );
}
