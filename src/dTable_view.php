<!-- Шаблоны форм для dTable -->
<div id="dTableFilterElements">
  <!-- Форма фильтр - input -->
  <div class="modal dTableFilterTextModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Modal title</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">

          <div class="input-group mb-3">
            <input type="text" class="form-control" placeholder="" aria-label="">
            <button class="btn btn-outline-secondary input-text-reset-button" type="button"><i class="fa fa-times"></i></button>
          </div>

        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
          <button type="button" class="btn btn-primary">Применить</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Форма фильтр - выбор из справочника + all -->
  <div class="modal dTableFilterSelectModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Modal title</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <input class="form-control" type="text" value="">
          <div class="list"></div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
          <button type="button" class="btn btn-primary">Применить</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Форма фильтр - интервал дат -->
  <div class="modal dTableFilterDateIntervalModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Modal title</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="input-group mb-3">
            <input type="text" class="form-control date-1 datepickerModal" placeholder="" aria-label="" autocomplete="off">
            <button class="btn btn-outline-secondary input-text-reset-button" type="button"><i class="fa fa-times"></i></button>
            <span class="input-group-text">-</span>
            <input type="text" class="form-control date-2 datepickerModal" placeholder="" aria-label="" autocomplete="off">
            <button class="btn btn-outline-secondary input-text-reset-button" type="button"><i class="fa fa-times"></i></button>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
          <button type="button" class="btn btn-primary">Применить</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Форма фильтр - интервал -->
  <div class="modal dTableFilterIntervalModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Modal title</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="input-group mb-3">
            <input type="number" class="form-control num-1 " placeholder="От" aria-label="" autocomplete="off">
            <button class="btn btn-outline-secondary input-text-reset-button" type="button"><i class="fa fa-times"></i></button>
            <span class="input-group-text">-</span>
            <input type="number" class="form-control num-2 " placeholder="До" aria-label="" autocomplete="off">
            <button class="btn btn-outline-secondary input-text-reset-button" type="button"><i class="fa fa-times"></i></button>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
          <button type="button" class="btn btn-primary">Применить</button>
        </div>
      </div>
    </div>
  </div>


  <!-- Форма выбор колонок -->
  <div class="modal modal-lg dTableSelectColumnsModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Настроить колонки</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="dTableColumns mb-3 row">
            <div class="col-6 text-muted">Видимые колонки</div>
            <div class="col-6 text-muted">Остальные колонки</div>
            <div class="col-6">
              <div class="input-group input-group-sm my-3">
                <input type="text" class="form-control border-0 border-bottom input-selected" placeholder="Поиск" aria-label="">
                <button class="btn btn-outline-secondary input-text-reset-button border-0 border-bottom" type="button"><i class="fa fa-times"></i></button>
              </div>
            </div>
            <div class="col-6">
              <div class="input-group input-group-sm my-3">
                <input type="text" class="form-control border-0 border-bottom input-other" placeholder="Поиск" aria-label="">
                <button class="btn btn-outline-secondary input-text-reset-button border-0 border-bottom" type="button"><i class="fa fa-times"></i></button>
              </div>
            </div>
            <div class="col-6 list-group connectedSortable columns-selected"></div>
            <div class="col-6 list-group connectedSortable columns-other"></div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary btn-reset" data-bs-dismiss="modal" title="Сбросить настройки">Сбросить <i class="fa fa-refresh"></i></button>
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
          <button type="button" class="btn btn-primary">Применить</button>
        </div>
      </div>
    </div>
  </div>
</div>