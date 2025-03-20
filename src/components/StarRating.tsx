import { FC, useState } from "react";
import { FaStar } from "react-icons/fa";

const StarRating: FC<{ rating: number; onChange: (value: number) => void }> = ({
  rating,
  onChange,
}) => {
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          className={`cursor-pointer text-2xl ${
            (hover ?? rating) >= star ? "text-yellow-500" : "text-gray-300"
          }`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(null)}
        />
      ))}
    </div>
  );
};

export default StarRating;
