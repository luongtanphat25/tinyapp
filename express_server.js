const express = require('express');
const app = express();
const PORT = 3000;
const cookieParser = require('cookie-parser');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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
  const userID = req.cookies.user_id;
  const urls = urlsForUser(userID);
  console.log(urls);
  const templateVars = {
    urls: urls,
    username: req.cookies.user_id ? users[req.cookies.user_id].email : '',
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const templateVars = {
    username: req.cookies.user_id ? users[req.cookies.user_id].email : '',
  };
  if (templateVars.username) {
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get('/urls/:id', (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    username: req.cookies.user_id ? users[req.cookies.user_id].email : '',
  };
  if (templateVars.username && urlDatabase[req.params.id].userID === req.cookies.user_id) {
    res.render('urls_show', templateVars);
  } else {
    res.statusCode = 400;
    res.send('only user who created the url can see it');
  }
});

app.post('/urls', (req, res) => {
  if (req.cookies.user_id) {
    console.log(req.body.longURL);
    createShortURL(req.body.longURL, req.cookies.user_id);
    res.redirect('/urls');
  } else {
    res.statusCode = 400;
    res.send('only user can create new urls');
  }
});

app.get('/u/:id', (req, res) => {
  const id = req.params.id;
  if (!(id in urlDatabase)) {
    res.send('invalid id');
  } else {
    const longURL = urlDatabase[id].longURL;
    res.redirect(longURL);
  }
});

//MODIFIFEisdfasdf
app.post('/urls/:id/delete', (req, res) => {
  const username = req.cookies.user_id ? users[req.cookies.user_id].email : '';

  if (username && urlDatabase[req.params.id].userID === username) {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
  } else {
    res.send('only user who created this url can modified it.');
  }
});

//MODIFIed here
app.post('/urls/:id/edit', (req, res) => {
  const username = req.cookies.user_id ? users[req.cookies.user_id].email : '';
  if (username && urlDatabase[req.params.id].userID === username) {
    if (req.body.newURL !== '') {
      urlDatabase[req.params.id].longURL = req.body.newURL;
    }
    res.redirect('/urls');
  } else {
    res.send('only user who created this url can modified it.');
  }
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email);
  if (!user) {
    res.statusCode = 400;
    res.send('Email not registerded yet');
    return;
  }
  if (password !== user.password) {
    res.statusCode = 400;
    res.send('Password incorrect');
    return;
  } else {
    res.cookie('user_id', user.id);
    res.redirect('/urls');
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  const templateVars = {
    username: req.cookies.user_id ? users[req.cookies.user_id].email : '',
  };
  if (templateVars.username) {
    res.redirect('/urls');
  } else {
    res.render('register', templateVars);
  }
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.statusCode = 400;
    res.send('Email or password empty');
    return;
  }

  if (getUserByEmail(email)) {
    res.statusCode = 400;
    res.send('Email already registerd');
    return;
  }

  let id = '';
  do {
    id = generateRandomString(6);
  } while (id in users);
  users[`${id}`] = { id, email: email, password: password };

  res.cookie('user_id', id);
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  const templateVars = {
    username: req.cookies.user_id ? users[req.cookies.user_id].email : '',
  };
  res.render('login', templateVars);
});

const getUserByEmail = (email) => {
  for (const user in users) {
    if (users[user].email === email) return users[user];
  }
  return;
};

const createShortURL = (url, id) => {
  let short = '';
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL] === url) {
      console.log('exits');
      return;
    }
  }

  do {
    short = generateRandomString(6);
  } while (short in urlDatabase);
  console.log(short);
  urlDatabase[`${short}`] = {
    longURL: url,
    userID: id,
  };
  console.log(urlDatabase);
};

const generateRandomString = (length) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const urlsForUser = (id) => {
  const userURLs = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  return userURLs;
};
