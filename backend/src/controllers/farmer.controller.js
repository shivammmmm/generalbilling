import Farmer from "../models/Farmer.js";

// ================= ADD FARMER =================

export const addFarmer = async (req, res) => {
  try {
    const {
      name,
      mobileNumber,
      village = "",
      address = "",
      aadhaarNumber,
      gstNumber,
      creditLimit = 0,
      defaultRateType,
      status = "active",
    } = req.body;

    // validation

    if (!name || !mobileNumber) {
      return res.status(400).json({
        message: "Customer name and mobile are required",
      });
    }

    // check existing customer

    const existingFarmer = await Farmer.findOne({ mobileNumber });

    if (existingFarmer) {
      return res.status(400).json({
        message: "Customer already exists",
      });
    }

    // create farmer

    const farmer = await Farmer.create({
      name,
      mobileNumber,
      village,
      address,
      aadhaarNumber,
      gstNumber,
      creditLimit,
      defaultRateType: defaultRateType || "Rate A",
      status,
    });

    res.status(201).json({
      success: true,
      message: "Customer Added Successfully",
      farmer,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ================= GET ALL FARMERS =================

export const getAllFarmers = async (req, res) => {
  try {
    const farmers = await Farmer.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalFarmers: farmers.length,
      farmers,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ================= GET SINGLE FARMER =================

export const getSingleFarmer = async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id);

    if (!farmer) {
      return res.status(404).json({
        message: "Farmer not found",
      });
    }

    res.status(200).json({
      success: true,
      farmer,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ================= UPDATE FARMER =================

export const updateFarmer = async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id);

    if (!farmer) {
      return res.status(404).json({
        message: "Farmer not found",
      });
    }

    const updatedFarmer = await Farmer.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        returnDocument: "after",
      }
    );

    res.status(200).json({
      success: true,
      message: "Farmer Updated Successfully",
      updatedFarmer,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ================= DELETE FARMER =================

export const deleteFarmer = async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id);

    if (!farmer) {
      return res.status(404).json({
        message: "Farmer not found",
      });
    }

    await Farmer.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Farmer Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ================= SEARCH FARMER =================

export const searchFarmer = async (req, res) => {
  try {
    const keyword = req.query.keyword;

    const farmers = await Farmer.find({
      $or: [
        {
          name: { $regex: keyword, $options: "i" },
        },
        {
          village: { $regex: keyword, $options: "i" },
        },
        {
          mobileNumber: { $regex: keyword, $options: "i" },
        },
      ],
    });

    res.status(200).json({
      success: true,
      totalResults: farmers.length,
      farmers,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
