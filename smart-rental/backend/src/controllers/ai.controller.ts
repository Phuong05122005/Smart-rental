import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import MLR from 'ml-regression-multivariate-linear';

export const predictRoomPrice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { area, capacity } = req.body;

    if (!area || !capacity) {
      res.status(400).json({ message: 'Vui lòng cung cấp diện tích (area) và sức chứa (capacity).' });
      return;
    }

    // Lấy dữ liệu lịch sử từ Database (làm Dataset cho ML)
    const rooms = await prisma.room.findMany({
      where: {
        price: { gt: 0 },
        area: { gt: 0 },
        capacity: { gt: 0 }
      },
      select: { price: true, area: true, capacity: true }
    });

    let xTrain: number[][] = [];
    let yTrain: number[][] = [];

    if (rooms.length >= 5) {
      // Dùng dữ liệu thật từ Cloud Database nếu đủ lớn
      xTrain = rooms.map(r => [Number(r.area), Number(r.capacity)]);
      yTrain = rooms.map(r => [Number(r.price)]);
    } else {
      // Dummy Dataset mồi (Pre-trained data) để Demo nếu DB chưa đủ dữ liệu
      xTrain = [
        [15, 1], [20, 2], [25, 2], [30, 3], [35, 4], [40, 4], [50, 5]
      ];
      yTrain = [
        [2000000], [2800000], [3200000], [4000000], [4500000], [5000000], [6000000]
      ];
    }

    // Huấn luyện mô hình Hồi quy tuyến tính đa biến (Multivariate Linear Regression)
    const mlr = new MLR(xTrain, yTrain);

    // Dự đoán giá cho đầu vào mới
    const prediction = mlr.predict([Number(area), Number(capacity)]);
    
    // Làm tròn giá tới hàng ngàn
    let predictedPrice = Math.round(prediction[0] / 1000) * 1000;
    
    // Đảm bảo giá không âm hoặc quá thấp (VD: Thấp nhất 1 triệu)
    if (predictedPrice < 1000000) {
      predictedPrice = 1000000;
    }

    res.json({
      message: 'Dự đoán thành công',
      data: {
        predicted_price: predictedPrice,
        model_details: {
          algorithm: 'Multivariate Linear Regression',
          training_samples: xTrain.length
        }
      }
    });
  } catch (error) {
    console.error('[predictRoomPrice]', error);
    res.status(500).json({ message: 'Lỗi server khi chạy mô hình AI/ML' });
  }
};
