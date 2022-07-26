import React from "react";
import { Link } from "react-router-dom";

import { RocketIcon } from "@radix-ui/react-icons";

/* Component */
import PersonalBoards from "../../components/listings/personal-boards/PersonalBoards";
import { AlertBox } from "../../components/common/";
import Hook from "./hook.userProfile";
const UserProfile = () => {
  const {
    userName,
    userMail,
    isVerified,
    userProfile,
    profileName,
    isAdmin,

    /* Actions */
    handleLogOut,
    handlePersonalBoard,
    handleCallAlertBox,
  } = Hook();
  return (
    <>
      {userProfile !== null && (
        <section>
          <div className="container px-5 lg:px-0 flex-col font-secondary mx-auto my-5 flex justify-center ">
            {/* Profile Info */}
            <div className="flex justify-center">
              <div className="lg:w-[45%] w-full flex gap-4 items-center md:items-start justify-center flex-col md:flex-row px-5 py-8 rounded-lg shadow">
                <div className="user-profile w-28 h-28 rounded-lg flex justify-center items-center text-white font-bold shadow-md">
                  {profileName}
                </div>
                <table
                  className="profile-table"
                  style={{ borderSpacing: "20px", verticalAlign: "top" }}
                >
                  <tbody className="text-dark">
                    <tr>
                      <td className="font-bold text-gray-500">Name </td>
                      <td className="pl-3">{userName}</td>
                    </tr>
                    <tr>
                      <td className="font-bold  align-top text-gray-500">
                        Mail{" "}
                      </td>
                      <td className="pl-3">
                        {userMail} <br />
                        <span className="text-xs">
                          {isVerified
                            ? "Your Email is verified"
                            : "You are unverified"}
                          .
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2}>
                        <button
                          onClick={() =>
                            handleCallAlertBox("Are you sure to log out?")
                          }
                          className="px-4 py-2  font-bold bg-danger text-white rounded text-xs table ml-auto mt-3"
                        >
                          Log Out
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="w-full">
              {!isAdmin && (
                <div className="flex flex-col items-center mb-10">
                  <div className="mt-5 w-full">
                    <PersonalBoards />

                    <hr className="my-5" />
                  </div>
                  <Link onClick={handlePersonalBoard} to={"/my-boards/new"}>
                    <button
                      className={`rounded-md py-2 px-4 flex justify-center items-center gap-2 font-secondary shadow-md  bg-info text-white`}
                    >
                      Create New Board <RocketIcon />
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
      <AlertBox confirmAction={handleLogOut} />
    </>
  );
};

export default UserProfile;
