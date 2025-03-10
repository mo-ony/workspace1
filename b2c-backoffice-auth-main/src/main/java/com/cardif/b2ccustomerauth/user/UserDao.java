package com.cardif.b2ccustomerauth.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.dao.EmptyResultDataAccessException;

@Repository
public class UserDao {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * Trouve l'email à partir du token.
     * 
     * @param token Le token à rechercher.
     * @return L'email associé au token, ou null si aucun email n'est trouvé.
     */
    public String findEmailFromToken(String token) {
        String sql = "SELECT us.EMAIL " +
                     "FROM OP_TOKEN TOK " +
                     "INNER JOIN OP_USERS us ON us.ID = TOK.USER_ID " +
                     "WHERE TOK.REVOKED = 0 AND TOK.EXPIRED = 0 AND TOK.TOKEN = ?";
        try {
            return jdbcTemplate.queryForObject(sql, new Object[]{token}, String.class);
        } catch (EmptyResultDataAccessException e) {
            // Si aucun résultat n'est trouvé, renvoyez null ou gérez l'exception comme vous le souhaitez
            return null;
        }
    }
}
