const BrandOrder = require("../models/brandOrder");
const InfOrder = require("../models/infOrder");

exports.createNewOrder = async (req, res) => {
  const {
    brandName,
    campaignName,
    collaborationId,
    campaignDescription,
    selectedInfluencers,
    infIdArr,
  } = req.body;
  const InfIdArrParsed = JSON.parse(infIdArr);
  let createdOrder;

  try {
    // Initialize variables for file paths
    let imagePaths = "";
    let videoPath = "";
    let audioPath = "";

    // Check if files are uploaded
    if (req.files) {
      // Handle images - assuming `image` field can have multiple files
      if (req.files.image) {
        imagePaths = req.files.image.map((file) => file.path).join(", "); // Join image paths as a single string
      }

      // Handle video - assuming `video` field has one file
      if (req.files.video) {
        videoPath = req.files.video[0].path; // Only one video, so just take the first one
      }

      // Handle audio - assuming `audio` field has one file
      if (req.files.file) {
        audioPath = req.files.file[0].path; // Only one audio, so just take the first one
      }
    }
    createdOrder = new BrandOrder({
      brandName,
      campaignName,
      collaborationId,
      campaignDescription,
      video: videoPath,
      images: imagePaths,
      selectedInfluencers: JSON.parse(selectedInfluencers),
      audio: audioPath,
    });

    InfIdArrParsed.forEach(async (id) => {
      try {
        const cretedNewInfOrder = await new InfOrder({
          brandName,
          campaignName,
          campaignDescription,
          infId: id,
          images: imagePaths,
          brandOrderId: createdOrder._id,
        });
        await cretedNewInfOrder.save();
      } catch (error) {
        console.log(error);
        return res
          .status(500)
          .json({ message: "Failed to create new influencer order" });
      }
    });
    await createdOrder.save();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Failed to create new order" });
  }

  return res
    .status(201)
    .json({ message: "New order created successfully", createdOrder });
};
