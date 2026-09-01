import Event from "../models/event.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/Cloudinary.js";
const getAllEvents = async (req, res) => {
  /*This is a dynamic filtering API. Instead of writing separate APIs like:

/events
/events?category=Music
/events?search=concert

the same API handles all these cases. */

  try {
    const { category, search } = req?.query;

    const filters = {};
    if (category) {
      filters.category = category;
    }
    if (search?.trim()) {
      filters.title = { $regex: search, $options: "i" };
    }
    const events = await Event.find(filters)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res
      .status(200)
      .json(new ApiResponse(200, events, "Events fetched successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "Failed to fetch events");
  }
};

const getEventById = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.findById(id)?.populate("createdBy", "name email");
    if (!event) {
      throw new ApiError(404, "Event not found");
    }
    res
      .status(200)
      .json(new ApiResponse(200, event, "Event fetched successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "Failed to fetch event");
  }
};

const createEvent = async (req, res) => {
  const {
    title,
    description,
    category,
    location,
    date,
    totalTickets,
    ticketPrice,
  } = req.body;

  if (
    !title?.trim() ||
    !description?.trim() ||
    !category?.trim() ||
    !location?.trim() ||
    !date ||
    totalTickets == null ||
    ticketPrice == null
  ) {
    throw new ApiError(400, "All fields are required");
  }
  const imageLocalPath = req.file?.path;
  let image;
  let imagePublicId;
  try {
    result = await uploadOnCloudinary(imageLocalPath);
    image = result?.url;
    imagePublicId = result?.public_id;
    console.log("Uploaded EventImage");
  } catch (error) {
    console.log("Error uploading avatar", error);
    throw new ApiError(500, "Failed to upload Image");
  }

  try {
    const event = await Event.create({
      title,
      description,
      category,
      location,
      date,
      image,
      imagePublicId,
      totalTickets,
      ticketPrice,
      createdBy: req.user._id,
    });
    res
      .status(201)
      .json(new ApiResponse(201, event, "Event created successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "Failed to create event");
  }
};

const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      category,
      location,
      date,
      totalTickets,
      ticketPrice,
    } = req.body;

    // Validation
    if (
      !title?.trim() ||
      !description?.trim() ||
      !category?.trim() ||
      !location?.trim() ||
      !date ||
      totalTickets == null ||
      ticketPrice == null
    ) {
      throw new ApiError(400, "All fields are required");
    }

    // Find existing event
    const event = await Event.findById(id);

    if (!event) {
      throw new ApiError(404, "Event not found");
    }

    // Update image only if a new image is provided
    if (req.file?.path) {
      // Store old image public ID
      const oldImagePublicId = event.imagePublicId;

      // Upload new image
      const uploadedImage = await uploadOnCloudinary(req.file.path);

      if (!uploadedImage) {
        throw new ApiError(500, "Image upload failed");
      }

      // Update event with new image
      event.image = uploadedImage.secure_url;
      event.imagePublicId = uploadedImage.public_id;

      // Delete old image
      if (oldImagePublicId) {
        await deleteOnCloudinary(oldImagePublicId);
      }
    }

    // Update event fields
    event.title = title.trim();
    event.description = description.trim();
    event.category = category.trim();
    event.location = location.trim();
    event.date = date;
    event.totalTickets = totalTickets;
    event.ticketPrice = ticketPrice;

    await event.save();

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update event",
    });
  }
};

const deleteEventById = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.findByIdAndDelete(id);
    if (!event) {
      throw new ApiError(404, "Event not found");
    }
    await deleteOnCloudinary(event.imagePublicId);
    res
      .status(200)
      .json(new ApiResponse(200, event, "Event deleted successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "Failed to delete event");
  }
};

export {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEventById,
};
