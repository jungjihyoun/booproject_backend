const shortid = require("shortid");
const maria = require("../database/connect/maria");
const s3 = require("../modules/multer");

// ******************

// 해당 유저의 부캐릭터 정보 불러오기
const getSubcharacter = function (req, res, next) {
  maria.query(
    `select * from subcharacter where user_id = '${req.params.user_id}' `,
    function (err, rows, fields) {
      if (!err) {
        console.log(rows);
        res.send(rows);
      } else {
        console.log("query error : " + err);
        res.send(err);
      }
    }
  );
};

// [record] 부캐릭터 쓰기
const postSubCharacter = function (req, res, next) {
  const ima_path = req.file.location;

  const post_id = `BO${shortid.generate()}`;
  maria.query(
    `INSERT INTO subcharacter(user_id,  subcharacter_id ,img_path,  startDate, title, subtitle , goal , secret) VALUES  ("${req.params.user_id}","${post_id}","${ima_path}","${req.body.startDate}","${req.body.title}","${req.body.subtitle}","${req.body.goal}","${req.body.secret}")`,

    function (err, rows, fields) {
      if (err) {
        console.log("post Subcharacter fail", err);
      } else {
        console.log("post Subcharacter success");
        res.json({ status: 200, body: req.file });
      }
    }
  );
};

// 부캐릭터 삭제
const deleteSubCharacter = function (req, res, next) {
  console.log(req.params.user_id, req.params.subcharacter_id);
  var idx = req.params.user_id;
  var passwd = req.body.subcharacter_id;
  var datas = [idx, passwd];

  maria.query(
    `DELETE FROM subcharacter WHERE user_id = '${req.params.user_id}' AND  subcharacter_id = '${req.params.subcharacter_id}'`,
    function (err, result) {
      if (err) console.error("에러", err);
      if (result.affectedRows == 0) {
        console.log("틀렸습니다", result);
      } else {
        console.log("성공", result);
      }
    }
  );
};

// [get]  다른 부캐 불러오기
const getOtherSubcharacter = function (req, res, next) {
  console.log("???", req.params.user_id);
  maria.query(
    `select * from subcharacter where user_id not in ('${req.params.user_id}') AND secret = 0 `,
    function (err, rows, fields) {
      if (!err) {
        console.log("get Other Boo ", rows);
        res.send(rows);
      } else {
        console.log("query error : " + err);
      }
    }
  );
};

const getLike = function (req, res, next) {
  maria.query(
    `select subcharacter_id from likes where user_id = '${req.params.user_id}'`,
    function (err, rows, fields) {
      if (err) {
        console.log("get likeState fail", err);
      } else {
        console.log("get likeState success", rows);

        var likeList = [];
        for (var data of rows) {
          likeList.push(data.subcharacter_id);
        }
        console.log(likeList);
        res.send(likeList);
      }
    }
  );
};

// 좋아요
const postSubCharacterLike = function (req, res) {
  if (!req.body.likeState) {
    // like 추가
    maria.query(
      `INSERT INTO likes(user_id,  subcharacter_id) VALUES ("${req.params.user_id}","${req.params.subcharacter_id}")`,
      function (err, rows, fields) {
        if (err) {
          console.log("post likes fail", err);
        } else {
          console.log("post likes success");

          maria.query(
            `update subcharacter set likeCount = likeCount + 1 where subcharacter_id= '${req.params.subcharacter_id}'`,
            function (err, rows, fields) {
              if (err) {
                console.log("post likes fail", err);
              } else {
                console.log("post likeCount success", rows);
              }
            }
          );
        }
      }
    );
  } else {
    // ㅣike 삭제
    maria.query(
      `DELETE FROM likes WHERE user_id = '${req.params.user_id}' AND  subcharacter_id = '${req.params.subcharacter_id}'`,
      function (err, rows, fields) {
        if (err) {
          console.log("post likes fail", err);
        } else {
          console.log("post likes success");

          maria.query(
            `update subcharacter set likeCount = likeCount - 1 where subcharacter_id= '${req.params.subcharacter_id}'`,
            function (err, rows, fields) {
              if (err) {
                console.log("post likes fail", err);
              } else {
                console.log("post likeCount success", rows);
              }
            }
          );
        }
      }
    );
  }
};

const postImage = function (req, res, next) {
  console.log(req);
  maria.query(
    `update subcharacter set img_path = '${req.file.location}' where post_id= '${req.params.post_id}'`,
    function (err, rows, fields) {
      if (err) {
        console.log("사진 추가 실패", err);
      } else {
        console.log("사진 추가 성공", rows);
        res.json({ status: 200, uri: req.file.location });
      }
    }
  );
  next();
};

module.exports = {
  getSubcharacter,
  postSubCharacter,
  deleteSubCharacter,
  getOtherSubcharacter,
  getLike,
  postSubCharacterLike,
  postImage,
};
