import * as yup from "yup";

export const userCreateSchema = () =>
  yup.object().shape({
    email: yup.string().email().required(),
    password: yup.string().min(8).required(),
    name: yup.string().required(),
    role: yup.string().oneOf(["ACCOUNTANT", "TECHNICIAN"]).required(),
  });
