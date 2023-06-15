/* eslint-disable camelcase */
const express = require('express');
const app = express();
const PORT = 3000;
// const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: 'session',
    keys: ['secret'],
    maxAge: 24 * 60 * 60 * 1000,
  })
);

const urlDatabase = {
  b6UTxQ: {
    longURL: 'https://www.tsn.ca',
    userID: 'aJ48lW',
  },
  i3BoGr: {
    longURL: 'https://www.google.ca',
    userID: 'aJ48lW',
  },
};

const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur',
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk',
  },
};

app.get('/', (req, res) => {
  res.send('Hello');
});

app.listen(PORT, () => {
  console.log(`Example app listening on ${PORT}`);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  const templateVars = { greetings: 'Hello World!' };
  res.render('hello_world', templateVars);
});

app.get('/urls', (req, res) => {
  const userID = req.session.user_id;
  const urls = urlsForUser(userID);
  const templateVars = {
    urls: urls,
    username: req.session.user_id ? users[req.session.user_id].email : '',
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const templateVars = {
    username: req.session.user_id ? users[req.session.user_id].email : '',
  };

  if (templateVars.username) {
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get('/urls/:id', (req, res) => {
  const { id } = req.params;
  const templateVars = {
    id,
    longURL: '',
    username: '',
  };

  if (req.session.user_id) {
    const user = users[req.session.user_id];
    const url = urlDatabase[id];

    if (url && url.userID === req.session.user_id) {
      templateVars.longURL = url.longURL;
      templateVars.username = user.email;
      return res.render('urls_show', templateVars);
    }
  }

  res.status(400).send('Only the user who created the URL can see it.');
});

app.post('/urls', (req, res) => {
  if (req.session.user_id) {
    const { longURL } = req.body;
    createShortURL(longURL, req.session.user_id);
    res.redirect('/urls');
  } else {
    res.status(400).send('Only users can create new URLs.');
  }
});

app.get('/u/:id', (req, res) => {
  const { id } = req.params;
  if (!(id in urlDatabase)) {
    res.send('invalid id');
  } else {
    const longURL = urlDatabase[id].longURL;
    res.redirect(longURL);
  }
});

//delete url
app.post('/urls/:id/delete', (req, res) => {
  const { id } = req.params;
  const username = req.session.user_id ? users[req.session.user_id].email : '';

  if (username && urlDatabase[id].userID === req.session.user_id) {
    delete urlDatabase[id];
    res.redirect('/urls');
  } else {
    res.send('Only the user who created this URL can modify it.');
  }
});

//edit url
app.post('/urls/:id/edit', (req, res) => {
  const { id } = req.params;
  const username = req.session.user_id ? users[req.session.user_id].email : '';

  if (username && urlDatabase[id].userID === req.session.user_id) {
    const newURL = req.body.newURL.trim();
    if (newURL !== '') {
      urlDatabase[id].longURL = newURL;
    }
    res.redirect('/urls');
  } else {
    res.status(403).send('Only the user who created this URL can modify it.');
  }
});

//login to account
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email);

  if (!user) {
    res.status(400).send('Email not registered yet');
    return;
  }

  const passwordMatch = bcrypt.compareSync(password, user.password);

  if (!passwordMatch) {
    res.status(400).send('Incorrect password');
    return;
  }

  req.session.user_id = user.id;
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  const { user_id } = req.session;
  const username = user_id ? users[user_id].email : '';

  if (username) {
    res.redirect('/urls');
  } else {
    res.render('register', { username });
  }
});

//create user account
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    res.status(400).send('Email or password is empty');
    return;
  }

  if (getUserByEmail(email)) {
    res.status(400).send('Email already registered');
    return;
  }

  let id;
  do {
    id = generateRandomString(6);
  } while (id in users);

  users[id] = { id, email, password: hashedPassword };
  req.session.user_id = id;
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  const { user_id } = req.session;
  const username = user_id ? users[user_id].email : '';
  const templateVars = { username };

  res.render('login', templateVars);
});

const getUserByEmail = (email) => {
  for (const user in users) {
    if (users[user].email === email) return users[user];
  }
  return;
};

const createShortURL = (url, id) => {
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].longURL === url) {
      console.log('URL already exists');
      return;
    }
  }

  let short;
  do {
    short = generateRandomString(6);
  } while (short in urlDatabase);

  urlDatabase[short] = {
    longURL: url,
    userID: id,
  };
};

const generateRandomString = (length) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }

  return result;
};

const urlsForUser = (id) => {
  const userURLs = {};

  for (const shortURL in urlDatabase) {
    const { userID, longURL } = urlDatabase[shortURL];

    if (userID === id) {
      userURLs[shortURL] = longURL;
    }
  }

  return userURLs;
};
