import React from "react";

const TimeAgo = ({ postedDate }) => {
  const timeAgo = (date) => {
    const posted = new Date(date);
    const now = new Date();
    const diffMs = now - posted;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffYears = Math.floor(diffDays / 365);
    const diffWeeks = Math.floor((diffDays % 365) / 7);
    const remainingDays = diffDays % 7;

    if (diffDays === 0) {
      return "Today";
    }

    let result = "";
    if (diffYears > 0)
      result += `${diffYears} year${diffYears > 1 ? "s" : ""} `;
    if (diffWeeks > 0)
      result += `${diffWeeks} week${diffWeeks > 1 ? "s" : ""} `;
    if (remainingDays > 0 || result === "")
      result += `${remainingDays} day${remainingDays > 1 ? "s" : ""}`;

    return result.trim() + " ago";
  };

  return <span>{timeAgo(postedDate)}</span>;
};

export default TimeAgo;
