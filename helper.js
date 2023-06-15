const getUserByEmail = (email, db) => {
  for (const user in db) {
    if (db[user].email === email) return db[user];
  }
  return;
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

const urlsForUser = (id, db) => {
  const userURLs = {};

  for (const shortURL in db) {
    const { userID, longURL } = db[shortURL];

    if (userID === id) {
      userURLs[shortURL] = longURL;
    }
  }

  return userURLs;
};

const createShortURL = (url, id, db) => {
  for (const shortURL in db) {
    if (db[shortURL].longURL === url) {
      console.log('URL already exists');
      return;
    }
  }

  let short;
  do {
    short = generateRandomString(6);
  } while (short in db);

  db[short] = {
    longURL: url,
    userID: id,
  };
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser, createShortURL };
