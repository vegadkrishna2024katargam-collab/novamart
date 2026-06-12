function serializeUser(user) {
  return {
    id: user._id,
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    profileImage: user.profileImage,
    defaultAddress: user.defaultAddress || null,
    savedAddresses: Array.isArray(user.savedAddresses) ? user.savedAddresses : [],
    lastLoginAt: user.lastLoginAt || null,
    loginCount: Number(user.loginCount || 0),
  };
}

module.exports = { serializeUser };
