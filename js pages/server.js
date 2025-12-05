const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');
const session = require('express-session');

const DATA_FILE = path.join(__dirname, 'data', 'users.json');
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'topify-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 } // 1 hour
}));

// Serve static files from project root so the html pages work
app.use(express.static(path.join(__dirname)));

async function readUsers(){
  try{
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(raw || '{}');
  }catch(e){
    return {};
  }
}

async function writeUsers(users){
  await fs.mkdir(path.dirname(DATA_FILE), {recursive:true});
  await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2), 'utf8');
}

app.get('/api/ping', (req,res)=> res.json({ok:true}));

app.get('/api/session', (req,res)=>{
  if(req.session && req.session.username){
    return res.json({authenticated:true, username: req.session.username});
  }
  res.json({authenticated:false});
});

app.post('/api/register', async (req,res)=>{
  const {username, password} = req.body || {};
  if(!username || !password) return res.status(400).json({error:'Missing username or password'});
  const users = await readUsers();
  if(users[username]) return res.status(409).json({error:'User already exists'});
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  users[username] = { hash, created: Date.now() };
  await writeUsers(users);
  // create session
  req.session.username = username;
  res.json({ok:true, username});
});

app.post('/api/login', async (req,res)=>{
  const {username, password} = req.body || {};
  if(!username || !password) return res.status(400).json({error:'Missing username or password'});
  const users = await readUsers();
  const u = users[username];
  if(!u) return res.status(401).json({error:'Invalid credentials'});
  const ok = await bcrypt.compare(password, u.hash);
  if(!ok) return res.status(401).json({error:'Invalid credentials'});
  req.session.username = username;
  res.json({ok:true, username});
});

app.post('/api/logout', (req,res)=>{
  req.session.destroy(()=>{ res.json({ok:true}); });
});

app.listen(PORT, ()=>{
  console.log(`Topify JSON DB auth server running on http://localhost:${PORT}`);
});
