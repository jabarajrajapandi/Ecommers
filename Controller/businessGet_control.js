const { getBusinessRecordsByRole } = require('../Model/businessGet_model');

function getBusinessRecords(req, res) {

    const { user_id, page = 1, limit = 10 } = req.query;

    if (!user_id) {
        return res.status(200).json({
            Response: {
                Status: '0',
                Message: 'User ID is required.'
            }
        });
    }

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    if (pageNumber <= 0 || limitNumber <= 0) {
        return res.status(200).json({
            Response: {
                Status: '0',
                Message: 'Page and limit must be positive integers.'
            }
        });
    }

    getBusinessRecordsByRole(user_id, pageNumber, limitNumber)
        .then(({ businessRecords, totalRecords }) => {
            if (businessRecords.length === 0) {
                return res.status(200).json({
                    Response: {
                        Status: '0',
                        Message: 'No records found.'
                    }

                });
            }
            return res.status(200).json({
                Response: {
                    Status: '1',
                    Message: 'Business records retrieved successfully.',
                    data: {
                        businessRecords,
                        pagination: {
                            page: pageNumber,
                            limit: limitNumber,
                            totalRecords,
                            totalPages: Math.ceil(totalRecords / limitNumber)
                        }
                    }
                }
            });
        })
        .catch((error) => {
            return res.status(500).json({
                Response: {
                    Status: '0',
                    Message: error.message
                }
            });
        });
}

module.exports = {
    getBusinessRecords
};
