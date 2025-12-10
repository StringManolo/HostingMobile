#!/usr/bin/env node

const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('<h1>Hello World from behind CG-NAT!</h1>');
});

app.listen(PORT, () => {
  console.log(`Server running locally on http://localhost:${PORT}`);
});
