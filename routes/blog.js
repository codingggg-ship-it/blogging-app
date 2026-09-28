const { Router } = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const Blog = require("../models/blog");
const Comment = require("../models/comment");

const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.resolve(
      "./public/uploads",
      req.user._id.toString(),
    );

    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },

  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.get("/add-new", (req, res) => {
  return res.render("addBlog", {
    user: req.user,
  });
});

router.post("/", upload.single("coverImage"), async (req, res) => {
  const { title, body } = req.body;

  const blog = await Blog.create({
    title,
    body,
    coverImageURL: `/uploads/${req.user._id}/${req.file.filename}`,
    createdBy: req.user._id,
  });

  return res.redirect("/");
});
router.get("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  const comments = await Comment.find({
    blogId: req.params.id,
  }).populate("createdBy");

  return res.render("blog", {
    user: req.user,
    blog,
    comments,
  });
});
router.post("/comment/:blogId", async (req, res) => {
  const { content } = req.body;

  await Comment.create({
    content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
  });

  return res.redirect(`/blog/${req.params.blogId}`);
});
module.exports = router;
