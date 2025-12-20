export const generateOtp = (length = 6): string => {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;

  return Math.floor(min + Math.random() * (max - min)).toString();
};
