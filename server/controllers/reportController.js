import Report from '../models/Report.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * @route   POST /api/reports
 * @desc    Submit a safety, misconduct, or fake request report
 * @access  Private
 */
export const createReport = async (req, res) => {
  try {
    const {
      reportedUserId,
      reportedRequestId,
      category,
      description,
    } = req.body;

    if (!category || !description || !description.trim()) {
      return sendError(res, 400, 'Report category and detailed description are required.');
    }

    const report = await Report.create({
      reporterId: req.user._id,
      reportedUserId: reportedUserId || null,
      reportedRequestId: reportedRequestId || null,
      category,
      description: description.trim(),
      status: 'PENDING',
    });

    return sendSuccess(
      res,
      201,
      'Your report has been submitted confidentially to platform moderators.',
      report
    );
  } catch (error) {
    console.error('[CREATE REPORT ERROR]:', error);
    return sendError(res, 500, 'Failed to submit report.');
  }
};
