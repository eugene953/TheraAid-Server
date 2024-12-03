import pool from '../config/database';
import { UserProps } from '../types/userTypes';

export const userQuery = async (userData: UserProps): Promise<UserProps> => {
  const {
    username,
    email,
    phone_number,
    id_card_number,
    address,
    password,
    confirm_pwd,
  } = userData;

  const query = `
  INSERT INTO users (username, email, phone_number, id_card_number, address, password, confirm_pwd)
  VALUES ($1, $2, $3, $4, $5, $6, $7)
  RETURNING *;
`;
  const values = [
    username,
    email,
    phone_number,
    id_card_number,
    address,
    password,
    confirm_pwd,
  ];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

{
  /**

import { UserProps } from "../types/userTypes";

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const joi = require('jio');
const passwordComplexity = require('joi-passwordComplexity');


const userSchema = new mongoose.Schema({
    username:{ require:true} ,
    email: { require:true} ,
    phoneNumber:{ require:true} ,
    idCardNumber: { require:true} ,
    address:{ require:true} ,
    password:{ require:true} ,
    confirmPassword:{ require:true} ,
  }
)
   */
}
