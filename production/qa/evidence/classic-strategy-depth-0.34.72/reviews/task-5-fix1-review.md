原4项均ADDRESSED：到期tick事务engine1448+test28；缺meta校验faction33–42+tests29–30/35；零随机掉落/固定粮金engine1165/campaign28/classic107+test32；来袭双按钮campaign86–87/classic106–107+test33。
新Important faction-system.js:41–42 旧战斗完成后返城存档非法。允许pre-camp旧march和battle，但phase return仍要求march.start<camp.createdAt，而真实普通结算把start重写为返城开始。单次实验oldmarch validtrue、oldbattle validtrue、真实胜利return start1791194423000、createdAt1791194400001，validfalse。区分出发与返城时刻，补完成/返城/reload回归。
范围外无。既有122/122日志已读未重跑，只做此具体疑点一次实验，无修改。Fixround结论open1。
