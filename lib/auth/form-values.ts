export function getAuthFormValues(formData: FormData) {
  return {
    loginCode: formData.get("loginCode"),
    password: formData.get("password")
  };
}
