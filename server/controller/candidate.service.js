const addGoogleCandidate =
  (Candidate) =>
  ({ id, email, firstName, lastName, profilePhoto }) => {
    const candidate = new Candidate({
      id,
      email,
      firstName,
      lastName,
      profilePhoto,
      source: "google",
    });
    return candidate.save();
  };

const getCandidates = (Candidate) => () => {
  return Candidate.find({});
};

const getCandidateByEmail =
  (Candidate) =>
  async ({ email }) => {
    return await Candidate.findOne({ email });
  };
const addLocalCandidate =
  (Candidate) =>
  ({ id, email, firstName, lastName, password }) => {
    const candidate = new Candidate({
      id,
      email,
      firstName,
      lastName,
      password,
      source: "local",
    });
    return candidate.save();
  };
module.exports = (Candidate) => {
  return {
    addGoogleCandidate: addGoogleCandidate(Candidate),
    addLocalCandidate: addLocalCandidate(Candidate),
    getCandidates: getCandidates(Candidate),
    getCandidateByEmail: getCandidateByEmail(Candidate),
  };
};
