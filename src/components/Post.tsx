import { FC, useEffect, useState } from "react";
import styles from "./Post.module.css";
import { Avatar, makeStyles } from "@material-ui/core";
import { db } from "../firebase";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";
import firebase from "firebase/app";
import SendIcon from "@material-ui/icons/Send";
import MessageIcon from "@material-ui/icons/Message";

interface PROPS {
  id: string;
  avatar: string;
  image: string;
  text: string;
  timestamp: any;
  username: string;
}

interface COMMENT {
  id: string;
  avatar: string;
  text: string;
  timestamp: any;
  username: string;
}

const useStyles = makeStyles((theme) => ({
  small: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    marginRight: theme.spacing(3),
  },
}));

const Post: FC<PROPS> = (props) => {
  const classes = useStyles();
  const user = useSelector(selectUser);
  const [isSubmit, setIsSubmit] = useState(false);
  const [openComments, setOpenComments] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<COMMENT[]>([
    {
      id: "",
      avatar: "",
      text: "",
      timestamp: null,
      username: "",
    },
  ]);

  useEffect(() => {
    if (props.id) {
      db.collection("posts")
        .doc(props.id)
        .collection("comments")
        .orderBy("timestamp", "desc")
        .get()
        .then((snapshot) => {
          setComments(
            snapshot.docs.map((doc) => ({
              id: doc.id,
              avatar: doc.data().avatar,
              text: doc.data().text,
              timestamp: doc.data().timestamp,
              username: doc.data().username,
            }))
          );
        });
    }
  }, [props.id, isSubmit]);

  const newComment = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    await db.collection("posts").doc(props.id).collection("comments").add({
      avatar: user.photoUrl,
      text: comment,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      username: user.displayName,
    });

    setComment("");
    setIsSubmit(!isSubmit);
  };

  return (
    <div className={styles.post}>
      <div className={styles.post_avatar}>
        <Avatar src={props.avatar} />
      </div>

      <div className={styles.post_body}>
        <div>
          <div className={styles.post_header}>
            <h3>
              <span className={styles.post_headerUser}>@{props.username}</span>
              <span className={styles.post_headerTime}>
                {new Date(props.timestamp?.toDate()).toLocaleString()}
              </span>
            </h3>
          </div>

          <div className={styles.post_tweet}>
            <p>{props.text}</p>
          </div>
        </div>

        {props.image && (
          <div className={styles.post_tweetImage}>
            <img src={props.image} alt="tweet" />
          </div>
        )}

        <MessageIcon
          className={styles.post_commentIcon}
          onClick={() => setOpenComments(!openComments)}
        />

        {openComments && (
          <>
            {comments.map((com) => (
              <div key={com.id} className={styles.post_comment}>
                <Avatar src={com.avatar} className={classes.small} />

                <span className={styles.post_commentUser}>@{com.username}</span>
                <span className={styles.post_commentText}>{com.text}</span>
                <span className={styles.post_headerTime}>
                  {new Date(com.timestamp?.toDate()).toLocaleString()}
                </span>
              </div>
            ))}

            <form onSubmit={newComment}>
              <div className={styles.post_form}>
                <input
                  className={styles.post_input}
                  type="text"
                  placeholder="Type new comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />

                <button
                  disabled={!comment}
                  className={
                    comment ? styles.post_button : styles.post_buttonDisable
                  }
                  type="submit"
                >
                  <SendIcon />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Post;
