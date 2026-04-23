export const sendEmail = async ({ to, subject }) => {
  console.log(`Mock email sent to ${to}: ${subject}`);
  return true;
};
