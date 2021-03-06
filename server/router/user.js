const express = require('express')
const Sequelize = require('sequelize')
const { User, Dep, Feedback, Attendance, } = require('../models')
const eventproxy = require('eventproxy')

const router = express.Router()

router.get('/', (req, res) => {
  const {
    userId = null,
    userName = null
  } = req.query;

  const queryConditions = {
    companyId: 1
  }
  if (userName) {
    queryConditions.userName = userName
  }
  if (userId) {
    queryConditions.userId = userId
  }

  User.findAll({
    where: queryConditions,
    attributes: ['userName', 'userAvatar', 'userId', 'depId'],
    include: [{
      model: Dep,
      where: { depId: Sequelize.col('dep.depId') }
    }]
  }).then((d) => {
    res.send({
      code: 0,
      data: JSON.parse(JSON.stringify(d))
    })
  }).catch((err) => {
    console.log(err);
  });
});

router.get('/:userId', (req, res) => {
  const { userId } = req.params
  const ep = new eventproxy();

  // 查询用户上级
  ep.on('userLeader', (user) => {
    if (user.dep.depOwnerId === parseInt(userId, 10) && user.dep.depParentId !== 0) {
      // 为部门负责人
      Dep.findAll({
        where: {
          depId: user.dep.depParentId
        },
        include: [{
          model: User,
          attributes: ['userName', 'userId', 'userAvatar'],
          where: { depOwnerId: Sequelize.col('user.userId') }
        }]
      }).then((d) => {
        user.userLeader = JSON.parse(JSON.stringify(d[0])).user
        res.send({
          code: 0,
          data: user
        })
      })
    } else {
      // 非部门负责人
      User.findAll({
        attributes: ['userId', 'userName', 'userAvatar'],
        where: {
          userId: user.dep.depOwnerId
        },
      }).then((d) => {
        user.userLeader = JSON.parse(JSON.stringify(d[0]))
        res.send({
          code: 0,
          data: user
        })
      })
    }
  });

  User.findAll({
    where: {
      userId
    },
    attributes: ['userAvatar', 'userName', 'userMisId', 'userMisId', 'userSex', 'userId', 'userTel', 'userSign', 'userWorkPlace', 'userExt'],
    include: [{
      model: Dep,
      attributes: ['depId', 'depName', 'depOwnerId', 'depParentId'],
      where: { depId: Sequelize.col('dep.depId') }
    }]
  }).then((d) => {
    const user = JSON.parse(JSON.stringify(d[0]))
    ep.emit('userLeader', user);
  }).catch((err) => {
    console.log(err);
  });
});

router.get('/search/:value', (req, res) => {
  const { value } = req.params
  User.findAll({
    where: {
      [Sequelize.Op.or]: [
        {
          userName: {
            [Sequelize.Op.like]: `%${value}%`
          }
        },
        {
          userMisId: {
            [Sequelize.Op.like]: `%${value}%`
          }
        },
      ]
    },
    attributes: ['userMisId','userName','userId', 'userAvatar'],
  }).then((d) => {
    res.send({
      code: 0,
      data: JSON.parse(JSON.stringify(d))
    })
  }).catch((err) => {
    console.log(err);
  });
})

router.post('/', (req, res) => {
  const body = req.body;
  User.upsert({
    userName: body.userName,
    userTel: body.userTel,
    depId: body.depId || null,
    companyId: 1,
    userRegisterTime: Date.parse(new Date())
  }).then((d) => {
    res.send({
      code: 0,
      data: d
    })
  }).catch((err) => {
    console.log(err);
  });
});

router.post('/feedback', (req, res) => {
  const {
    fbUserId,
    fbUserName,
    fbContent,
    fbTime
  } = req.body;
  Feedback.upsert({
    fbUserId,
    fbUserName,
    fbContent,
    fbTime
  }).then((d) => {
    res.send({
      code: 0,
      msg:d
    })
  }).catch((err) => {
    console.log(err);
  });
});

router.post('/paganname', (req, res) => {
  const {
    userId,
    userSign,
  } = req.body;
  User.update({
    userSign
  }, {
    where: { userId },
    plain: true
  }).then((d) => {
    res.send({
      code: 0,
      msg:d
    })
  }).catch((err) => {
    console.log(err);
  });
});

router.post('/cottage', (req, res) => {
  const {
    userId,
    strikeTime,
    hasCottage,
    cottageReason,
  } = req.body;
  Attendance.upsert({
    userId,
    strikeTime,
    hasCottage,
    cottageReason,
  }).then((d) => {
    res.send({
      code: 0,
      msg:d
    })
  }).catch((err) => {
    console.log(err);
  });
});

router.put('/', (req, res) => {
  const body = req.body;
  User.update({
    userName: body.userName,
    userTel: body.userTel,
    depId: body.depId || null,
  }, {
    where: { userId: body.userId },
    plain: true
  }).then((d) => {
    res.send({
      code: 0,
      data:d
    })
  }).catch((err) => {
    console.log(err);
  });
});


router.post('/password', (req, res) => {
  const {
    newPwd,
    oldPwd,
    userId
  } = req.body;

  User.findAll({
    where: {
      userId,
      userPwd: oldPwd
    }
  }).then((d) => {
    if (d.length > 0) {
      User.update({
        userPwd: newPwd
      }, {
        where: { userId },
        plain: true
      }).then((d) => {
        res.send({
          code: 0
        })
      }).catch((err) => {
        console.log(err);
      });
    } else {
      res.send({
        code: 1,
        msg: '旧密码不正确'
      })
    }
  })
});

module.exports = router
