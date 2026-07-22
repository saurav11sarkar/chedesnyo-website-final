import React from "react";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface BlogCardProps {
  id: string; // ✅ match API _id
  image: string;
  date: string;
  title: string;
  onViewDetails?: () => void;
}

const BlogCard: React.FC<BlogCardProps> = ({
  id,
  image,
  date,
  title,
  onViewDetails = () => {},
}) => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 max-w-md">
      <div className="relative overflow-hidden h-48 bg-gray-200">
        <Image
          src={image}
          alt={title}
          width={400}
          height={300}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-6 flex justify-between items-start">
        <div className="flex-1 pr-4">
          <p className="text-gray-500 text-sm font-medium mb-2">{date}</p>
          <h3 className="text-gray-900 text-lg font-semibold mb-0 line-clamp-2 leading-tight">
            {title.length > 20 ? title.slice(0, 20) + "..." : title}
          </h3>
        </div>
        <div className="flex-shrink-0 flex items-start">
          <Link href={`/blogs/${id}`}>
            <button
              onClick={onViewDetails}
              className="inline-flex items-center gap-2 text-green-600 font-medium hover:text-green-700 transition-colors duration-200 group"
            >
              Details bekijken
              <ChevronRight
                size={18}
                className="group-hover:translate-x-1 transition-transform duration-200"
              />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
