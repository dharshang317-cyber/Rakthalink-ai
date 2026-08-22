/**
 * Returns a valid profile picture for any user.
 * If user has a Google avatar, returns it. Otherwise generates a beautiful avatar using their name initials.
 */
export const getUserAvatar = (userOrName) => {
  if (typeof userOrName === 'object' && userOrName !== null) {
    if (userOrName.avatar && !userOrName.avatar.includes('placeholder')) {
      return userOrName.avatar;
    }
    const name = userOrName.name || userOrName.donorName || userOrName.patientName || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=dc2626&color=ffffff&bold=true&rounded=true`;
  }

  const name = userOrName || 'User';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=dc2626&color=ffffff&bold=true&rounded=true`;
};
