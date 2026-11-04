const clinicModel = require('../models/clinicModel');

const getClinic = async (req, res, next) => {
    try {
        const clinic = await clinicModel.getClinic();

        if (!clinic) {
            return res.status(404).json({
                error: 'Clinic not found'
            });
        }

        const googleMapsUrl =
            `https://www.google.com/maps/search/?api=1&query=${clinic.latitude},${clinic.longitude}`;

        return res.status(200).json({
            ...clinic,
            googleMapsUrl
        });

    } catch (error) {
        next(error);
    }
};

const updateClinic = async (req, res, next) => {
    try {
        const { name, address, latitude, longitude } = req.body;

        // Validate required fields.
        if (
            typeof name !== 'string' || !name.trim() ||
            typeof address !== 'string' || !address.trim() ||
            latitude === undefined || longitude === undefined ||
            !Number.isFinite(Number(latitude)) ||
            !Number.isFinite(Number(longitude))
        ) {
            return res.status(400).json({
                error: 'Please provide a valid name, address, latitude and longitude'
            });
        }

        const clinic = await clinicModel.getClinic();

        if (!clinic) {
            return res.status(404).json({
                error: 'Clinic not found'
            });
        }

        const updatedClinic = await clinicModel.updateClinic(
            clinic.id,
            {
                name: name.trim(),
                address: address.trim(),
                latitude: Number(latitude),
                longitude: Number(longitude)
            }
        );

        const googleMapsUrl =
            `https://www.google.com/maps/search/?api=1&query=${updatedClinic.latitude},${updatedClinic.longitude}`;

        return res.status(200).json({
            message: 'Clinic updated successfully',
            clinic: {
                ...updatedClinic,
                googleMapsUrl
            }
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getClinic,
    updateClinic
};