const Query = require("../models/query");
const User = require("../models/user");

const addQuery = async (req, res) => {
  const { name, email, phone, message } = req.body;
  const createdQuery = new Query({
    name,
    email,
    phone,
    message,
  });
  try {
    await createdQuery.save();
  } catch (error) {
    return res.status(404).json({ message: "Something went wrong!" });
  }
  return res.status(200).json({
    message: "We have received your message and will respond promptly!",
  });
};

const deleteQuery = async (req, res) => {
  const { id } = req.body;
  let query;
  try {
    query = await Query.findById(id);
    if (!query) {
      throw new Error();
    }
  } catch (error) {
    return res.status(404).json({ message: "Something went wrong!" });
  }
  try {
    await query.deleteOne();
  } catch (error) {
    return res.status(404).json({ message: "Something went wrong!" });
  }
  return res.status(200).json({
    message: "Query deleted.",
  });
};

const getAllqueries = async (req, res) => {
  const { id } = req.query;
  let admin;
  try {
    admin = await User.findById(id);
    if (!admin || !admin.isAdmin) {
      throw new Error();
    }
  } catch (error) {
    return res.status(404).json({ message: "Something went wrong!" });
  }
  let queries;
  try {
    queries = await Query.find({});
  } catch (error) {
    return res.status(404).json({ message: "Something went wrong!" });
  }
  return res.status(200).json({
    queries: queries.map((q) => {
      return q.toObject({ getters: true });
    }),
  });
};

exports.addQuery = addQuery;
exports.deleteQuery = deleteQuery;
exports.getAllqueries = getAllqueries;
