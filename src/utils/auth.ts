import bcrypt from "bcryptjs";

export const hashPassword = (password: string) => {
  return new Promise((resolve, reject) => {
    //funcion que hashea el password
    bcrypt.genSalt(12, (err, salt) => {
      if (err) {
        reject(err);
      }
      bcrypt.hash(password, salt!, (err, hash) => {
        if (err) {
          reject(err);
        }
        resolve(hash);
      });
    });
  });
};


export const comparePassword = (password: string, hashed: string) => {
  //funcion que compara el password ingresado con el hasheado
  return bcrypt.compare(password, hashed);
};
