package br.victal.pluscape.web.rest;

import br.victal.pluscape.domain.Size;
import br.victal.pluscape.repository.SizeRepository;
import br.victal.pluscape.web.rest.errors.BadRequestAlertException;

import io.github.jhipster.web.util.HeaderUtil;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;

import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing {@link br.victal.pluscape.domain.Size}.
 */
@RestController
@RequestMapping("/api")
public class SizeResource {

    private final Logger log = LoggerFactory.getLogger(SizeResource.class);

    private static final String ENTITY_NAME = "size";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final SizeRepository sizeRepository;

    public SizeResource(SizeRepository sizeRepository) {
        this.sizeRepository = sizeRepository;
    }

    /**
     * {@code POST  /sizes} : Create a new size.
     *
     * @param size the size to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new size, or with status {@code 400 (Bad Request)} if the size has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/sizes")
    public ResponseEntity<Size> createSize(@Valid @RequestBody Size size) throws URISyntaxException {
        log.debug("REST request to save Size : {}", size);
        if (size.getId() != null) {
            throw new BadRequestAlertException("A new size cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Size result = sizeRepository.save(size);
        return ResponseEntity.created(new URI("/api/sizes/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /sizes} : Updates an existing size.
     *
     * @param size the size to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated size,
     * or with status {@code 400 (Bad Request)} if the size is not valid,
     * or with status {@code 500 (Internal Server Error)} if the size couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/sizes")
    public ResponseEntity<Size> updateSize(@Valid @RequestBody Size size) throws URISyntaxException {
        log.debug("REST request to update Size : {}", size);
        if (size.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        Size result = sizeRepository.save(size);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, size.getId().toString()))
            .body(result);
    }

    /**
     * {@code GET  /sizes} : get all the sizes.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of sizes in body.
     */
    @GetMapping("/sizes")
    public List<Size> getAllSizes() {
        log.debug("REST request to get all Sizes");
        return sizeRepository.findAll();
    }

    /**
     * {@code GET  /sizes/:id} : get the "id" size.
     *
     * @param id the id of the size to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the size, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/sizes/{id}")
    public ResponseEntity<Size> getSize(@PathVariable Long id) {
        log.debug("REST request to get Size : {}", id);
        Optional<Size> size = sizeRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(size);
    }

    /**
     * {@code DELETE  /sizes/:id} : delete the "id" size.
     *
     * @param id the id of the size to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/sizes/{id}")
    public ResponseEntity<Void> deleteSize(@PathVariable Long id) {
        log.debug("REST request to delete Size : {}", id);
        sizeRepository.deleteById(id);
        return ResponseEntity.noContent().headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString())).build();
    }
}
