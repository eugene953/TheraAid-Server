export interface UserProps {
  id: string;
  username: string;
  email: string;
  phone_number: string;
  gender: string;
  password: string;
  profile: string | null;
  role: 'user';
}

export interface UserLoginProps {
  username: string;
  password: string;
}
