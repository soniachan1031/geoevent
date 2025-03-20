import { FC, ReactNode } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

/**
 * Renders up to 5 stars based on the numeric rating.
 * For example, a 4.3 rating => 4 full stars, 1 half star, 0 empty stars.
 */
const Stars: FC<{ rating: number }> = ({ rating }) => {
  const stars: ReactNode[] = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  for (let i = 0; i < fullStars; i++) {
    stars.push(<FaStar key={`full-${i}`} className="text-yellow-500" />);
  }
  if (hasHalfStar) {
    stars.push(<FaStarHalfAlt key="half" className="text-yellow-500" />);
  }
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<FaRegStar key={`empty-${i}`} className="text-yellow-500" />);
  }

  return <div className="flex items-center gap-1">{stars}</div>;
};

export default Stars;
