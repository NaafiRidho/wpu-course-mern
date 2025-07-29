import { Response } from 'express';
import { IReqUser } from '../utils/interfaces';
import uploader from '../utils/uploader'

export default {
    async single(req: IReqUser, res: Response) {
        if (!req.file) {
            return res.status(400).json({
                data: null,
                message: 'No file uploaded'
            });
        }
        try {
            const result = await uploader.uploadSingle(req.file as Express.Multer.File);
            return res.status(200).json({
                data: result,
                message: 'File uploaded successfully'
            })
        } catch {
            return res.status(500).json({
                data: null,
                message: 'Error uploading file',
            })
        }
    },
    async multiple(req: IReqUser, res: Response) {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                data: null,
                message: 'No file uploaded'
            });
        }
        try {
            const result = await uploader.uploadMultiple(req.files as Express.Multer.File[]);
            return res.status(200).json({
                data: result,
                message: 'Files uploaded successfully'
            })
        } catch {
            return res.status(500).json({
                data: null,
                message: 'Error uploading files',
            })
        }
    },
    async remove(req: IReqUser, res: Response) {
        try {
            const { fileUrl } = req.body as { fileUrl: string };
            const result = await uploader.remove(fileUrl);
            return res.status(200).json({
                data: result,
                message: 'File removed successfully'
            })
        } catch (error) {
            return res.status(500).json({
                data: null,
                message: 'Error removing file',
            })
        }
    },
};