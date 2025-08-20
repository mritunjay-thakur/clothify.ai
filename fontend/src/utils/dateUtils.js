export const groupChatsByDate = (chats = []) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(thisWeekStart.getDate() - today.getDay());

  return chats.reduce((groups, chat) => {
    const chatDate = new Date(chat.createdAt);
    let groupName;

    if (chatDate >= today) {
      groupName = "Today";
    } else if (chatDate >= yesterday) {
      groupName = "Yesterday";
    } else if (chatDate >= thisWeekStart) {
      groupName = "This Week";
    } else {
      groupName = "Older";
    }

    if (!groups[groupName]) {
      groups[groupName] = [];
    }

    groups[groupName].push(chat);
    return groups;
  }, {});
};
