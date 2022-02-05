export const userStatus = (user) => {
  return user.status === 'online' ? 'online' : 'offline';
};
