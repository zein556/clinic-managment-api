const clinicModel = require('../models/clinicModel');
const getClinic = async (req, res, next) => {
    try {
        const clinic = await clinicModel.getClinic();
        if (!clinic) {
            return res.status(404).json({ error: 'Clinic not found' });
        }
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${clinic.latitude},${clinic.longitude}`;
        res.json({ ...clinic, googleMapsUrl });
    } catch (error) {
        next(error);
    }   
}
module.exports = {
    getClinic
};