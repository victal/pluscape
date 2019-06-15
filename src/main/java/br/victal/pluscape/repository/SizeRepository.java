package br.victal.pluscape.repository;

import br.victal.pluscape.domain.Size;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;


/**
 * Spring Data  repository for the Size entity.
 */
@SuppressWarnings("unused")
@Repository
public interface SizeRepository extends JpaRepository<Size, Long> {

}
