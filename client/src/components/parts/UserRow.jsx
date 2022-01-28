import { useState } from "react";
import axios from "axios";
import UserLink from "./UserLink";
import Row from "./Row";
import Button from "./Button";
import Confirm from "./Confirm";
import { BanIcon, CheckCircleIcon, UserAddIcon, UserRemoveIcon } from "@heroicons/react/outline";
import Message from "./Message";
import UserMeta from "./UserMeta";
import RoleParser from "./RoleParser";
import { UserContext } from "../../context/UserContext";

const UserRow = (props) => {
  const [ajaxRes, setAjaxRes] = useState({})
  function submitForm(e) {
    axios
      .post(`/api/changeUserRole/`, {
        _id: props.user._id,
        type: e.target.value,
      })
      .then((data) => {
        setAjaxRes(data.data)
      })
      .catch(() => {
        setAjaxRes({success: false, message: "An error occured, try again later"})
      });
  }

  const decoySetPendingButton = () => <Button type="warning" icon={BanIcon}>Disapprove</Button>;
  const liveSetPendingButton = () => <Button onClick={submitForm} type="warning" value="setPending">Disapprove</Button>;
  
  return (
    <UserContext.Consumer>
      {(currentUser) =>
        currentUser.userPermissions === 6 ? (
          ajaxRes.message ? (
            <Row>
              <UserLink name={props.user.name} _id={props.user._id} />
              <UserMeta>{props.user.email}</UserMeta>
              <div className="md:text-right md:float-right"><Message isSuccess={ajaxRes.success} errType={ajaxRes.errType}>{ajaxRes.message}</Message></div>
              <div className="clear-both"></div>{/* Float Fix (clear-both) */}
            </Row>
          ) : (
            <Row>
              <UserLink name={props.user.name} _id={props.user._id} />
              <UserMeta>{props.user.email}</UserMeta>
              <div className="mt-2.5 md:mt-0 md:text-right md:float-right">
                {(props.user.pending ?
                <Button onClick={submitForm} type="good" icon={CheckCircleIcon} value="setPending">
                  Approve
                </Button>
                :
                <Confirm
                  decoyButton={decoySetPendingButton} 
                  liveButton={liveSetPendingButton}
                />
                )}
                <Button onClick={submitForm} type="outline" icon={UserAddIcon} value="promote">
                  Promote
                </Button>
                <Button onClick={submitForm} type="outline" icon={UserRemoveIcon} value="demote">
                  Demote
                </Button>
              </div>
              <div className="clear-both"></div>{/* Float Fix (clear-both) */}
            </Row>
          )
        ) : (
          <Row>
            <UserLink name={props.user.name} _id={props.user._id} />
            <UserMeta><RoleParser>{props.user.role}</RoleParser></UserMeta>
          </Row>
        )
      }
    </UserContext.Consumer>
  );
};

export default UserRow;
