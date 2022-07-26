import { useState } from "react";
import { useNavigate } from "react-router";

import { useForm } from "react-hook-form";

import { signInWithEmailAndPassword } from "firebase/auth";
import { getDocs } from "firebase/firestore";

/* Custom Hook */
import HookFirebaseAssets from "../../hook.firebaseAssets";

/* Constants */
import { HOME } from '../../constants/routeNames';

const Hook = () => {
  const { auth, adminCollection, userCollection, getSessionUserInfo } = HookFirebaseAssets();

  const navigate = useNavigate();

  const [isInvalid, setIsInvalid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const userSignIn = (data) => {
    setIsLoading(true);

    signInWithEmailAndPassword(auth, data.userMail, data.userPassword)
      .then((res) => {
        setIsInvalid(false);
        // console.log(res.user);
        setIsLoading(false);
        localStorage.setItem(
          "gui-userInfo",
          JSON.stringify({
            id: res.user.uid,
            email: res.user.email,
            accessToken: res.user.accessToken,
          })
        );

        localStorage.setItem("gui-verified", res.user.emailVerified);

        getDocs(userCollection)
        .then((res) => {
          if (auth.currentUser) {
            auth.currentUser.emailVerified === true &&
              localStorage.setItem("gui-verified", true);
          }

          let userInfoSha = res?.docs.filter((info) => {
            return info.data().email === data.userMail;
          });
          localStorage.setItem("gui-userId", userInfoSha[0]?.id);
          navigate(HOME);
          // console.log("set user Id.")
        })
        .catch((err) => {
          alert(err.message);
        });

        getDocs(adminCollection)
          .then((res) => {
            res.docs.map((item) => {
              item.data().email === data.userMail &&
                localStorage.setItem("interactingAdmin", true);
            });
            // navigate(HOME);
          })
          .catch((err) => {
            alert(err.message);
          });
      })
      .catch((err) => {
        setIsInvalid(true);
        setIsLoading(false);
      });
  };

  return {
    errors,
    register,
    isInvalid,
    isLoading,

    /* actions */
    handleSubmit,
    userSignIn,
  };
};

export default Hook;
