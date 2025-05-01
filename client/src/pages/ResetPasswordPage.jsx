const ResetPasswordPage = () => {
  return (
    <div>
      <h1>Reset Password</h1>
      <form>
        <div>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" required />
        </div>
        <div>
          <label htmlFor="new-password">New Password:</label>
          <input type="password" id="new-password" name="new-password" required />
        </div>
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
}
export default ResetPasswordPage;