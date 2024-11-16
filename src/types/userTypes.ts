export interface UserProps {
  username: string;
  email: string;
  phoneNumber: string;
  idCardNumber: number;
  address: string;
  password: string;
  confirmPassword: string;
}

export interface UserLoginProps {
  username: string;
  password: string;
}
