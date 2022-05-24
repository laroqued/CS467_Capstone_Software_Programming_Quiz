const addGoogleUser =
  (User) =>
  ({ id, google_email, firstName, lastName, profilePhoto }) => {
    console.log(id, google_email, firstName, lastName, profilePhoto);
    const user = new User({
      id,
      google_email,
      firstName,
      lastName,
      profilePhoto,
      source: "google",
    });
    return user.save();
  };

const addLocalUser =
  (User) =>
  ({ id, google_email, firstName, lastName, password }) => {
    const user = new User({
      id,
      google_email,
      firstName,
      lastName,
      password,
      source: "local",
    });
    return user.save();
  };

const getUsers = (User) => () => {
  return User.find({});
};

const getUserByEmail =
  (User) =>
  async ({ google_email }) => {
    return await User.findOne({ google_email });
  };

module.exports = (User) => {
  return {
    addGoogleUser: addGoogleUser(User),
    addLocalUser: addLocalUser(User),
    getUsers: getUsers(User),
    getUserByEmail: getUserByEmail(User),
  };
};
