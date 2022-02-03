const InvariantError = require("../../exceptions/InvariantError");
const {NotePayloadSchema, AlbumPayloadSchema, SongPayloadSchema} = require("./schema");

const OpenMusicValidator = {
    validateNotePayload: (payload) => {
        const validationResult = NotePayloadSchema.validate(payload);
        if(validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
    validateAlbumPayload: (payload) => {
        const validationResult = AlbumPayloadSchema.validate(payload);
        if(validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
    validateSongPayload: (payload) => {
        const validationResult = SongPayloadSchema.validate(payload);
        if(validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
};

module.exports = OpenMusicValidator;