export interface UserProps {
  username: string;
  email: string;
  phone_number: string;
  id_card_number: number;
  address: string;
  password: string;
  confirm_pwd: string;
  profile: string | null;
}

export interface UserLoginProps {
  username: string;
  password: string;
}
