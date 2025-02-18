/**
 * Создаёт объект dTable
 * @param {*} params Объект
 * Пример:
 * {
    dTableName: 'StudyProjectTable',                                      // Имя объекта для сохранения в LocalStorage
    dTableDOMObject: '#StudyProjectTable',                                // Имя блока на странице, куда будет загружена dTable
    loadTableMethodUrl: SITE_URL + "/StudyProject/StudyProject",          // URL который возвращает dTable
    loadDictForFilterUrl: SITE_URL + "/StudyProject/get_dict_for_filter", // URL который возвращает фильтры
    isCache: true,                                                        // Кэшировать настройки таблицы. По умолчанию true
    dTableDefault: {                                                      // Объект dTable для инициализации. Может быть закэширован
      v: VERSION                                                          // Версия. Для обновления объекта в хранилище в случае новой версии
      , page: 1                                                           // Текущая страница
      , page_row_count: 10                                                // Кол-во строк на странице
      , fields: {                                                         // Массив полей с параметрами
        studyProjectName: { show: "1", title: "Проект" },
        studyProjectStatusName: { show: "1", title: "Статус" },
        createdAt: { show: "1", title: "Дата создания" }
      }

    }
  }
 * Параметры для fields
 * show string Показывать ли колонку. Может быть '1' или '0'
 * title - Заголовок
 * ordType string - Тип сортировки по этому полю. Может быть "asc" или "desc" или отсутствовать
 */
  function DTable(params) {

    let thisDTable = this;
  
    this.versionDTableCache = 3;  // Версия кэширования всех dTable. Увеличить, если изменились каки-нибудь функции. Это обновит все dTable сохраненные в кэше у пользователей
  
    this.dTable = {};
    this.isCache = params.isCache ?? true;
    this.dTableTitle = params.dTableTitle ?? '';
    this.dTableDefault = params.dTableDefault;
  
    let dTableName = params.dTableName;
    let dTableDOMObject = params.dTableDOMObject;
    let loadTableMethodUrl = params.loadTableMethodUrl;
    let loadTableMethodUrlXls = params.loadTableMethodUrlXls;
    let loadDictForFilterUrl = params.loadDictForFilterUrl;
  
    let dModals = $('#dTableFilterElements'); // Контейнер с шаблонами модальных окон для dTable
    // Клонируем объекты модального окна
    let ModalFilterTextNode = $(dModals).find('.dTableFilterTextModal')[0].cloneNode(true);
    let ModalFilterSelectNode = $(dModals).find('.dTableFilterSelectModal')[0].cloneNode(true);
    let ModalFilterDateIntervalNode = $(dModals).find('.dTableFilterDateIntervalModal')[0].cloneNode(true);
    let ModalFilterIntervalNode = $(dModals).find('.dTableFilterIntervalModal')[0].cloneNode(true);
    let ModalFilterSelectColumnsNode = $(dModals).find('.dTableSelectColumnsModal')[0].cloneNode(true); // Настроить колонки
    // --Клонируем объекты модального окна
  
    this.savedTableToCookie = function (oTable) {
      oTable['versionDTableCache'] = thisDTable.versionDTableCache; // Добавляем параметр versionDTableCache
      localStorage.setItem(dTableName, JSON.stringify(oTable));
    };
  
    thisDTable.categroyColors = ['#3f51b5',
      '#006dc3', '#673ab7', '#e91e63', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#795548', '#9e9e9e', '#607d8b', '#f44336', '#9c27b0'];  // Цвета категорий колонок. По порядку следования
  
    // Берём ли таблицу из куки/localStorage?
    //let dTableFromCookie = getCookie(dTableName);
    let dTableFromCookie = localStorage.getItem(dTableName);
  
    if (dTableFromCookie === undefined || dTableFromCookie === null || dTableFromCookie.length === 0 || !this.isCache) {
      // Нет в куки или кэширование отключено
      thisDTable.dTable = JSON.parse(JSON.stringify(thisDTable.dTableDefault)); // Простое присвоение для объекта приводит к присвоению ссыли на объект
    } else {
      // Есть в куки
      let dTableFromCookieJSON = JSON.parse(dTableFromCookie);
  
      // Если текущая версия не совпадает с версией в куки, обновляем куки
      if (dTableFromCookieJSON['versionInstanceCache'] !== thisDTable.dTableDefault['versionInstanceCache'] ||
        dTableFromCookieJSON['versionDTableCache'] !== thisDTable.versionDTableCache) {
        thisDTable.dTable = JSON.parse(JSON.stringify(thisDTable.dTableDefault)); // Простое присвоение для объекта приводит к присвоению ссыли на объект
        thisDTable.savedTableToCookie(thisDTable.dTable);
      } else {
        thisDTable.dTable = dTableFromCookieJSON;
      }
    }
    //let dTable=JSON.parse();
    //console.log(dTable);
    //
    // --Берём ли таблицу из куки/localStorage?
    //
    /**
     * Загрузка таблицы
     * @returns {undefined}
     */
    this.loadTable = function loadTable() {
      $(dTableDOMObject).css('opacity', '0.5');
      $.ajax({
        url: loadTableMethodUrl,
        data: JSON.stringify(
          thisDTable.dTable
        ),
        type: "POST",
        contentType: "application/json",
        success: function (result) {
          $(dTableDOMObject).html(result);
          $(dTableDOMObject).css('opacity', '1');

          // Отмечаем выбранные строки
          if ('selected_rows' in thisDTable.dTable) {
            selectedRowsShow(); // Скрытие/показ счетчика выбранных строк
            $(dTableDOMObject).find(".table-dtable tbody tr").each(function(){
              let itemId = $(this).attr('data-id');
              let existingItemIndex=thisDTable.dTable.selected_rows.indexOf(itemId);
              if(existingItemIndex !== -1){
                // Если найден - ставим check
                $(this).find('.check_row').prop('checked',true);
              }
            });
          }
          // --Отмечаем выбранные строки
  
          // Доп.прокрутка
          //
          // Встраиваем сам элемент доп.прокрутки
          $(dTableDOMObject).find('.table-responsive').append('<div class="dtable-scroll"><div class="dtable-scroll-inner"></div></div>');
          dTableScrollRefresh(dTableDOMObject);  // Обновляем доп.прокрутку при инициализации
          //
          // Обновляем доп.прокрутку при ресайзе окна
          window.addEventListener('resize', () => dTableScrollRefresh(dTableDOMObject));
          // --Обновляем доп.прокрутку при ресайзе окна
          //
          // Обновляем доп.прокрутку при scroll document
          window.addEventListener('scroll', function() {
            dTableScrollRefresh(dTableDOMObject);
          });
          // --Обновляем доп.прокрутку при scroll document
          //
          // При scroll осн.прокрутки - синхронизируем с доп.прокруткой
          $(dTableDOMObject).find('.table-responsive').on('scroll',function(){
            let scrollOffset=$(dTableDOMObject).find('.table-responsive')[0].scrollLeft;

            $(dTableDOMObject).find('.dtable-scroll')[0].scrollTo({
              left: scrollOffset
            });

          })
          // --При scroll осн.прокрутки - синхронизируем с доп.прокруткой
          //
          // При scroll доп.прокрутки - синхронизируем с осн.прокруткой
          $(dTableDOMObject).find('.dtable-scroll').on('scroll',function(){
            let scrollOffset=$(dTableDOMObject).find('.dtable-scroll')[0].scrollLeft;

            $(dTableDOMObject).find('.table-responsive')[0].scrollTo({
              left: scrollOffset
            });

          })
          // --При scroll доп.прокрутки - синхронизируем с осн.прокруткой
          //
          // --Доп.прокрутка

          // Включить всплывающие подсказки везде. Это используется только в модуле User для колонок: Онлайн/Офлайн. 
          // Подумать, надо ли здесь это делать?
          var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
          var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl)
          })
          // --Включить всплывающие подсказки везде. Это используется только в модуле User для колонок: Онлайн/Офлайн. 
        }
      });
    }
    //
    // Сортировка таблицы
    $(dTableDOMObject).on('click', '.table-head-title', function () {
  
      let name = $(this).attr('data-name');
      
      let ordTypeNew = '';
      if(($(this).attr('data-ord-type') || '') === ''){
        ordTypeNew = 'asc';
      }else if(($(this).attr('data-ord-type') || '') === 'asc'){
        ordTypeNew = 'desc';
      }

      for (key in thisDTable.dTable['fields']) {
        if (name === key) {
          if(ordTypeNew.length){
            thisDTable.dTable['fields'][key]['ordType'] = ordTypeNew;
          }else{
            delete thisDTable.dTable['fields'][key]['ordType'];
          }
        } else {
          delete thisDTable.dTable['fields'][key]['ord'];
          delete thisDTable.dTable['fields'][key]['ordType'];
        }
      }
      thisDTable.savedTableToCookie(thisDTable.dTable);
      thisDTable.loadTable();
  
      return false;
    });
    // --Сортировка таблицы
    //
    // Нажатие на сброс элементов фильтров в строке с фильтрами
    $(dTableDOMObject).on('click', '.filterView .filterItem a.removeFilterItemElement', function () {
      let name = $(this).closest('.filterItem').attr('data-name');
      let valForRemove = $(this).attr('data-id');
  
      if ($(this).closest('.filterItem').attr('data-type') === 'fSelect') {
        let value = [];
        $(this).closest('.filterItem').find('a.removeFilterItemElement').each(function () {
          let v = $(this).attr('data-id');
          if (v !== valForRemove) {
            value.push(v);
          }
        });
        thisDTable.dTable['fields'][name]['filter'] = value;
  
        if (value.length === 0) {
          // Если массив пустой, filter не передаём
          delete thisDTable.dTable['fields'][name]['filter'];
        }
      }
  
      if ($(this).closest('.filterItem').attr('data-type') === 'fText') {
        delete thisDTable.dTable['fields'][name]['filter'];
      }
  
      if ($(this).closest('.filterItem').attr('data-type') === 'fDateInterval') {
        delete thisDTable.dTable['fields'][name]['filter'];
      }
  
      if ($(this).closest('.filterItem').attr('data-type') === 'fInterval') {
        delete thisDTable.dTable['fields'][name]['filter'];
      }
  
      //    dTable.page = 1;
      thisDTable.savedTableToCookie(thisDTable.dTable);
      thisDTable.loadTable();
  
      return false;
    });
    // --Нажатие на сброс элементов фильтров в строке с фильтрами
    //
    // Нажатие на сброс фильтра в строке с фильтрами
    $(dTableDOMObject).on('click', '.filterView .removeFilterItem', function () {
      let name = $(this).closest('.filterItem').attr('data-name');

      if ($(this).closest('.filterItem').attr('data-type') === 'fSelect') {
        // Если массив пустой, filter не передаём
        delete thisDTable.dTable['fields'][name]['filter'];
      }

      if ($(this).closest('.filterItem').attr('data-type') === 'fText') {
        delete thisDTable.dTable['fields'][name]['filter'];
      }

      if ($(this).closest('.filterItem').attr('data-type') === 'fDateInterval') {
        delete thisDTable.dTable['fields'][name]['filter'];
      }

      if ($(this).closest('.filterItem').attr('data-type') === 'fInterval') {
        delete thisDTable.dTable['fields'][name]['filter'];
      }

      //    dTable.page = 1;
      thisDTable.savedTableToCookie(thisDTable.dTable);
      thisDTable.loadTable();

      return false;
    });
    // --Нажатие на сброс фильтра в строке с фильтрами
  
    // Инициализация формы выбора колонок
    const ModalSelectColumns = new bootstrap.Modal(ModalFilterSelectColumnsNode, {});
    // --Инициализация формы выбора колонок
    // 
    // Инициализация форм фильтров
    //
    // Форма type=fText
    const ModalFilterText = new bootstrap.Modal(ModalFilterTextNode, {});
  
    // Фокус
    ModalFilterTextNode.addEventListener('shown.bs.modal', () => {
      $(ModalFilterTextNode).find('input').focus();
    });
    //
    // Форма type=fSelect
    const ModalFilterSelect = new bootstrap.Modal(ModalFilterSelectNode, {});
  
    // Фокус
    ModalFilterSelectNode.addEventListener('shown.bs.modal', () => {
      $(ModalFilterSelectNode).find('input').focus();
    });
    //
    // Форма type=fDateInterval
    const ModalFilterDateInterval = new bootstrap.Modal(ModalFilterDateIntervalNode, {});
  
    // Фокус
    ModalFilterDateIntervalNode.addEventListener('shown.bs.modal', () => {
      //    $(ModalFilterDateIntervalNode).find('input:first').focus();
  
      $(ModalFilterDateIntervalNode).find('.datepickerModal').datepicker({
        //comment the beforeShow handler if you want to see the ugly overlay
        beforeShow: function () {
          setTimeout(function () {
            $('.ui-datepicker').css('z-index', 1100); // Bootstrap modal z-index=1055
          }, 0);
        }
      });
  
    });
    // Форма type=fInterval
    const ModalFilterInterval = new bootstrap.Modal(ModalFilterIntervalNode, {});
  
    // Фокус
    ModalFilterIntervalNode.addEventListener('shown.bs.modal', () => {
      //    $(ModalFilterIntervalNode).find('input:first').focus();
    });
    // --Инициализация форм фильтров
    // 
    // Нажатие на кнопку выбора колонок - Настроить
    $(dTableDOMObject).on('click', '.SelectColumns', function () {
  
      thisDTable.drawSettingsFields();
  
      ModalSelectColumns.show();
  
      return false;
    });
    // --Нажатие на кнопку выбора колонок - Настроить
  
    /**
     * Прорисовка колонок в модальном окне Настроить колонки
     */
    this.drawSettingsFields = function () {
      //
      // Сбросим значения
      $(ModalFilterSelectColumnsNode).find('.dTableColumns .columns-selected').html('');
      $(ModalFilterSelectColumnsNode).find('.dTableColumns .columns-other').html('');
      //
      $(ModalFilterSelectColumnsNode).find('input.input-selected[type=text]').val('');
      $(ModalFilterSelectColumnsNode).find('input.input-other[type=text]').val('');
      // --Сбросим значения
  
      // Цвета категорий
      let categroys = [];
      // --Цвета категорий
  
      for (key in thisDTable.dTable['fields']) {
        let dTableColumns = '';
        //      l(dTable['fields'][key]['show'])
        let isShow = thisDTable.dTable['fields'][key]['show'] == '1';
        // let disabled = '';// key == 'FIO' ? ' disabled' : '';
        // let elementId = "dTableColumn-" + key;
        dTableColumns += '<a href="#" class="dTableColumn list-group-item list-group-item-action d-flex" data-name="' + key + '">';
        dTableColumns += '<i class="fa fa-arrows p-1 pe-2"></i>';
        // dTableColumns += '<input class="form-check-input" type="checkbox" value="" ' + checked + disabled + ' id="' + elementId + '">';
        dTableColumns += ' <div class="">';
        dTableColumns += '<span class="columnTitle" title="' + thisDTable.dTable['fields'][key]['title'] + '">' +
          thisDTable.dTable['fields'][key]['title'] +
          '</span>';
          if (thisDTable.dTable['fields'][key]['ordType'] === 'asc') {
            dTableColumns += '<i class="fa fa-long-arrow-up p-1 pe-2"></i>';
          } else if (thisDTable.dTable['fields'][key]['ordType'] === 'desc') {
            dTableColumns += '<i class="fa fa-long-arrow-down p-1 pe-2"></i>';
          }
        dTableColumns += '</div>';
        //
        // Категория
        let cat = thisDTable.dTable['fields'][key]['category'] || '';
        let categroyStyle = '';
        if (cat.length) {
          if (categroys.indexOf(cat) === -1) {
            categroys.push(cat)
          }
          let indexOfCat = categroys.indexOf(cat);
          let categroyColor = thisDTable.categroyColors[indexOfCat];
          categroyStyle = 'color:' + categroyColor;
        }
        // --Категория
        //
        dTableColumns += `<div class="flex-fill text-end px-1 small" style="${categroyStyle}">${cat}</div>`;
        dTableColumns += '</a>';
  
        if (isShow) {
          $(ModalFilterSelectColumnsNode).find('.dTableColumns .columns-selected').append(dTableColumns);
        } else {
          $(ModalFilterSelectColumnsNode).find('.dTableColumns .columns-other').append(dTableColumns);
        }
      }
  
      $(ModalFilterSelectColumnsNode).find('.dTableColumns .connectedSortable').sortable({
        connectWith: ".connectedSortable",
        items: '> .dTableColumn:visible', /* Для корректной работы с элементами display:none */
        update: function (event, ui) {
          // Сортировка прекратилась и DOM изменился
          // Запустить поиск, если вдруг введен фильтр
          // let val = $(ModalFilterSelectColumnsNode).find('input.input-other[type=text]').val();
          // let elementsForSearch = ModalFilterSelectColumnsNode.querySelectorAll(".columns-other .columnTitle");
          searchColumns($(ModalFilterSelectColumnsNode).find('input.input-other[type=text]').val(),
            ModalFilterSelectColumnsNode.querySelectorAll(".columns-other .columnTitle"));
  
          searchColumns($(ModalFilterSelectColumnsNode).find('input.input-selected[type=text]').val(),
            ModalFilterSelectColumnsNode.querySelectorAll(".columns-selected .columnTitle"));
        }
      })//.disableSelection();
      //
      // Событие клика на поле в окне "Настроить колонки"
      $(ModalFilterSelectColumnsNode).find('.dTableColumns .connectedSortable a').on('click',function(){
        let el=$(this);
        let elParent=$(this).closest('.connectedSortable');

        let elForAppend=$('.columns-selected');
        if((elParent).hasClass('columns-selected')){
          elForAppend=$('.columns-other');
        }
          
        $(ModalFilterSelectColumnsNode).find(elForAppend).append(el); // Перемещаем поле
        $(el).addClass('bg-warning-subtle');  // Временно подсвечиваем только что перемещённое поле
        setTimeout(() => $(el).removeClass('bg-warning-subtle'), 1000); // Убираем подсвечивание через 1 сек

        $(el)[0].scrollIntoView({
          behavior: "smooth",
          block: "end",
          inline: "nearest"
        });

      });
    }
    // --Событие клика на поле в окне "Настроить колонки"
    //
    // Форма Настроить колонки - Поиск значения в инпуте
    $(ModalFilterSelectColumnsNode).on('keyup', 'input.input-other[type=text]', function () {
      let val = $(this).val();
      let elementsForSearch = ModalFilterSelectColumnsNode.querySelectorAll(".columns-other .columnTitle");
      searchColumns(val, elementsForSearch);
    });
    $(ModalFilterSelectColumnsNode).on('keyup', 'input.input-selected[type=text]', function () {
      let val = $(this).val();
      let elementsForSearch = ModalFilterSelectColumnsNode.querySelectorAll(".columns-selected .columnTitle");
      searchColumns(val, elementsForSearch);
    });
    //
    // Форма Настроить колонки - Нажатие на сброс в input
    $(ModalFilterSelectColumnsNode).on('click', '.input-text-reset-button', function () {
      $(this).prev('input').val('').keyup();
    });
    // Форма Настроить колонки - Нажатие на Применить
    $(ModalFilterSelectColumnsNode).on('click', '.btn-primary', function () {
  
      // Пересортируем fields
      let fields = {};
  
      $(ModalFilterSelectColumnsNode).find('.dTableColumns .columns-selected .dTableColumn').each(function () {
        let name = $(this).attr('data-name');
  
        fields[name] = thisDTable.dTable['fields'][name];
        fields[name]['show'] = "1";
      });
      $(ModalFilterSelectColumnsNode).find('.dTableColumns .columns-other .dTableColumn').each(function () {
        let name = $(this).attr('data-name');
  
        fields[name] = thisDTable.dTable['fields'][name];
        fields[name]['show'] = "0";
      });
      //    l(fields);
      thisDTable.dTable['fields'] = fields;
      thisDTable.savedTableToCookie(thisDTable.dTable);
      ModalSelectColumns.hide();
      thisDTable.loadTable();
    });
    //
    // Форма Настроить колонки - Нажатие на Сбросить
    $(ModalFilterSelectColumnsNode).on('click', '.btn-reset', function () {
      //    deleteCookie('dTable');
      thisDTable.dTable = JSON.parse(JSON.stringify(thisDTable.dTableDefault)); // Простое присвоение для объекта приводит к присвоению ссыли на объект
      thisDTable.savedTableToCookie(thisDTable.dTable);
      ModalSelectColumns.hide();
      thisDTable.loadTable();
    });
    //
    // Форма фильтра fText - Нажатие на Применить
    $(ModalFilterTextNode).on('click', '.btn-primary', function () {
      let name = $(this).attr('data-name');
      let value = $(this).closest('.modal').find('input').val();
      thisDTable.dTable['fields'][name]['filter'] = value;
      thisDTable.dTable.page = 1;
      thisDTable.savedTableToCookie(thisDTable.dTable);
      ModalFilterText.hide();
      thisDTable.loadTable();
    });
    //
    // Форма фильтра fSelect - Нажатие на Применить
    $(ModalFilterSelectNode).on('click', '.btn-primary', function () {
      let name = $(this).attr('data-name');
      let value = [];
      let isAllSelected = $(this).closest('.modal').find('ul li input[value=all]').is(':checked');
      if (!isAllSelected) {
        $(this).closest('.modal').find('ul li input:checked').each(function () {
          let v = $(this).val();
          value.push(v);
        });
      }
      thisDTable.dTable['fields'][name]['filter'] = value;
  
      if (value.length === 0) {
        // Если массив пустой, filter не передаём
        delete thisDTable.dTable['fields'][name]['filter'];
      }
  
      thisDTable.dTable.page = 1;
      thisDTable.savedTableToCookie(thisDTable.dTable);
      ModalFilterSelect.hide();
      thisDTable.loadTable();
    });
    //
    // Форма фильтра fSelect - Поиск значения в инпуте
    $(ModalFilterSelectNode).on('keyup', '.modal-body input[type=text]', function () {
      let val = $(this).val();
      searchFilterSelectModal(val);
    });
    //
    // Форма фильтра fDateInterval - Нажатие на Применить
    $(ModalFilterDateIntervalNode).on('click', '.btn-primary', function () {
      let name = $(this).attr('data-name');
      let date1 = $(this).closest('.modal').find('.date-1').val();
      let date2 = $(this).closest('.modal').find('.date-2').val();
  
      thisDTable.dTable['fields'][name]['filter'] = [date1, date2];
      if (date1.length === 0 && date2.length === 0) {
        // Если массив пустой, filter не передаём
        delete thisDTable.dTable['fields'][name]['filter'];
      }
  
      thisDTable.dTable.page = 1;
      thisDTable.savedTableToCookie(thisDTable.dTable);
      ModalFilterDateInterval.hide();
      thisDTable.loadTable();
    });
    //
    // Форма фильтра fInterval - Нажатие на Применить
    $(ModalFilterIntervalNode).on('click', '.btn-primary', function () {
      let name = $(this).attr('data-name');
      let num1 = $(this).closest('.modal').find('.num-1').val();
      let num2 = $(this).closest('.modal').find('.num-2').val();
  
      thisDTable.dTable['fields'][name]['filter'] = [num1, num2];
      if (num1.length === 0 && num2.length === 0) {
        // Если массив пустой, filter не передаём
        delete thisDTable.dTable['fields'][name]['filter'];
      }
  
      thisDTable.dTable.page = 1;
      thisDTable.savedTableToCookie(thisDTable.dTable);
      ModalFilterInterval.hide();
      thisDTable.loadTable();
    });
    //
    // Форма фильтра fSelect - Нажатие на чекбокс
    $(ModalFilterSelectNode).on('click', 'input[type=checkbox]', function () {
      let val = $(this).val();
      let is_checked = $(this).is(':checked');
      if (val === 'all') {
        if (is_checked) {
          $(ModalFilterSelectNode).find('input[type=checkbox]').prop('checked', true);
        } else {
          $(ModalFilterSelectNode).find('input[type=checkbox]').prop('checked', false);
        }
      } else {
        $(ModalFilterSelectNode).find('input[type=checkbox][value=all]').prop('checked', false);
      }
    });
    //
    // Форма фильтра для всех modal форм - Нажатие на сброс в input
    $(ModalFilterTextNode).on('click', '.input-text-reset-button', function () {
      $(this).prev('input').val('');
    });
    $(ModalFilterSelectNode).on('click', '.input-text-reset-button', function () {
      $(this).prev('input').val('');
    });
    $(ModalFilterDateIntervalNode).on('click', '.input-text-reset-button', function () {
      $(this).prev('input').val('');
    });
    $(ModalFilterIntervalNode).on('click', '.input-text-reset-button', function () {
      $(this).prev('input').val('');
    });
    // --Форма фильтра для всех modal форм - Нажатие на сброс в input
    //
    // Нажатие на фильтр
    $(dTableDOMObject).on('click', 'table thead th a.a-filter', function () {
      let filter = $(this).attr('data-filter-value').split(',');  // Array
      let title = $(this).attr('data-title');
      let name = $(this).attr('data-name');
      let type = $(this).attr('data-type');
      if (type === 'fText') {
        $(ModalFilterTextNode).find('.modal-title').html(title);
        $(ModalFilterTextNode).find('input').val(filter);
        $(ModalFilterTextNode).find('.btn-primary').attr('data-name', name);
        ModalFilterText.show();
      }
      if (type === 'fSelect') {
        $(ModalFilterSelectNode).find('.modal-title').html(title);
        $(ModalFilterSelectNode).find('input').val('');
        $(ModalFilterSelectNode).find('.btn-primary').attr('data-name', name);
        $(ModalFilterSelectNode).find('.list').html('Загрузка ...');
        ModalFilterSelect.show();
        // Загрузка справочника
        let data = { type: name, filter: filter };
        let hasFilter = !(filter.length === 1 && filter[0] === 'null');
        if (!hasFilter) {
          // Если массив пустой, filter не передаём
          delete data['filter'];
        }
        $.ajax({
          url: loadDictForFilterUrl,
          data: data,
          type: "POST",
          success: function (result) {
            $(ModalFilterSelectNode).find('.list').html(result);
  
            // Если фильтра нет, сделаем чекбокс Все выбранным
            if (!hasFilter) {
              $(ModalFilterSelectNode).find('.list ul li input[value=all]').prop('checked', true);
            }
          }
        });
      }
      if (type === 'fDateInterval') {
        $(ModalFilterDateIntervalNode).find('.modal-title').html(title);
        $(ModalFilterDateIntervalNode).find('.btn-primary').attr('data-name', name);
        $(ModalFilterDateIntervalNode).find('input.date-1').val(filter[0]);
        $(ModalFilterDateIntervalNode).find('input.date-2').val(filter[1]);
  
        ModalFilterDateInterval.show();
  
        // $('.datepicker').datepicker({
        //   //comment the beforeShow handler if you want to see the ugly overlay
        //   beforeShow: function () {
        //     setTimeout(function () {
        //       $('.ui-datepicker').css('z-index', 1100); // Bootstrap modal z-index=1055
        //     }, 0);
        //   }
        // });
      }
      if (type === 'fInterval') {
        $(ModalFilterIntervalNode).find('.modal-title').html(title);
        $(ModalFilterIntervalNode).find('.btn-primary').attr('data-name', name);
        $(ModalFilterIntervalNode).find('input.num-1').val(filter[0]);
        $(ModalFilterIntervalNode).find('input.num-2').val(filter[1]);
  
        ModalFilterInterval.show();
      }
      return false;
    });
  
  
    // Покажем spinner перед первоначальной загрузкой
    $(dTableDOMObject).html(
      '\n\
                <div class="text-center loading-spinner">\n\
                  <div class="spinner-border text-primary" role="status">\n\
                    <span class="visually-hidden">Loading...</span>\n\
                  </div>\n\
                </div>');
  
    // Инициализация
    
    // Проверяем GET-параметры
    // Можно устанавливать фильтры, передав их в GET-параметре
    // Пример: dTableFields={"studyPotokName":{"filter":["29"]},"educationFormName":{"filter":["1","3"]}}
    let url = new URL(location.href);
    let dTableFields=url.searchParams.get('dTableFields');
    dataObj = JSON.parse(dTableFields);

    // Перебираем Поля пришедшие в GET-параметре
    // 
    for (keyGet in dataObj) {
      let paramFieldName=keyGet;

      // Перебираем fields - ищем совпадения
      for (key in thisDTable.dTable['fields']) {
        if (paramFieldName === key) {
          if("filter" in dataObj[keyGet]){
            if(dataObj[keyGet]['filter'].length){
              // Устанавливаем новый фильтр
              thisDTable.dTable['fields'][key]['filter'] = dataObj[keyGet]['filter'];
            }else{
              // Сбросим фильтр
              delete thisDTable.dTable['fields'][key]['filter'];
            }
          }
        }
      }
      // --Перебираем fields - ищем совпадения
    }
    // --Перебираем Поля пришедшие в GET-параметре

    thisDTable.savedTableToCookie(thisDTable.dTable);
    // --Проверяем GET-параметры

    // Первоначальная загрузка
    thisDTable.loadTable();

    // --Инициализация
    //
  
    /**
     * Нажатие на страницу
     */
    $(dTableDOMObject).on('click', '.pagination a.page-link', function () {
      thisDTable.dTable.page = $(this).attr('data-page');
      thisDTable.savedTableToCookie(thisDTable.dTable);
      thisDTable.loadTable();
      return false;
    });
  
    /**
     * Изменение кол-ва строк
     */
    $(dTableDOMObject).on('change', '.select_row_count', function () {
      thisDTable.dTable.page = 1;
      thisDTable.dTable.page_row_count = $(this).val();
      thisDTable.savedTableToCookie(thisDTable.dTable);
      thisDTable.loadTable();
      return false;
    });
  
    /**
     * Нажатие на чекбокс в строке или в заголовке
     */
    $(dTableDOMObject).on('click', 'input.check_row[type=checkbox]', function () {
      let val = $(this).val();
      let is_checked = $(this).is(":checked");
      if (val === "all") {
        if (is_checked) {
          $(dTableDOMObject).find("input.check_row[type=checkbox]").prop("checked", true);
        } else {
          $(dTableDOMObject).find("input.check_row[type=checkbox]").prop("checked", false);
        }

        // Сохраняем/удаляем все выбранные/сброшенные пункты в массив
        $(dTableDOMObject).find('input.check_row[type=checkbox]').not('[value=all]').each(function(){
          let itemId=$(this).closest('tr').attr('data-id');

          updateSelectedRows($(this).is(':checked'), itemId); // Добавить/удалить элемент в selected_rows

        });
        // --Сохраняем/удаляем все выбранные/сброшенные пункты в массив

      } else {
        $(dTableDOMObject).find("input.check_row[type=checkbox][value=all]").prop("checked", false);

        let itemId=$(this).closest('tr').attr('data-id');

        updateSelectedRows(is_checked, itemId); // Добавить/удалить элемент в selected_rows

      }

      // Сохраняем
      thisDTable.savedTableToCookie(thisDTable.dTable);
      selectedRowsShow();

    });

    /**
     * Добавить/удалить элемент в selected_rows
     * @param {*} is_checked 
     * @param {*} itemId 
     */
    function updateSelectedRows(is_checked, itemId){

      if (!('selected_rows' in thisDTable.dTable)) {
        // Добавим свойство, если его ещё нет
        thisDTable.dTable.selected_rows=[];
      }

      if(is_checked){
        if(!thisDTable.dTable.selected_rows.includes(itemId)){
          // Добавим ID в массив, если его ещё там нет
          thisDTable.dTable.selected_rows.push(itemId);
        }
      }else{
        // Ищем элемент в массиве
        let existingItemIndex=thisDTable.dTable.selected_rows.indexOf(itemId);
        if(existingItemIndex !== -1){
          // Если найден - удаляем
          thisDTable.dTable.selected_rows.splice(existingItemIndex, 1);
        }
      }

    }

    /**
     * Нажатие на Сброс Счетчика выбранных строк
     */
    $(dTableDOMObject).on('click', '.selected-rows .btn-reset', function () {

      if (('selected_rows' in thisDTable.dTable)) {
        // Если массив есть, очищаем его
        thisDTable.dTable.selected_rows=[];

        // Снимаем все отметки со всех строк на странице, если они есть
        $(dTableDOMObject).find('input.check_row[type=checkbox]').each(function(){
          $(this).prop('checked',false);
        });

        // Сохраняем
        thisDTable.savedTableToCookie(thisDTable.dTable);
        selectedRowsShow();
      }

      return false;
    });

    /**
     * Скрытие/показ Счетчика выбранных строк
     * Смотрит количество элементов в массиве
     * Вызывается из
     * - первоначальная загрузка (инициализация)
     * - событий установки/снятия чекбоксов в строках таблицы
     * - нажатие на счетчик выбранных строк - сброс
     */
    function selectedRowsShow(){
      if ('selected_rows' in thisDTable.dTable) {
        let selected_rows_count=thisDTable.dTable.selected_rows.length || 0;
        if(selected_rows_count>0){
          $(dTableDOMObject).find('.selected-rows .selected-rows-count').html(selected_rows_count);
          $(dTableDOMObject).find('.selected-rows').show();
        }else{
          $(dTableDOMObject).find('.selected-rows').hide();
        }
      }
    }
  
    /**
     * Поиск в фильтре с подсветкой найденной подстроки
     * @param {type} val
     * @returns {undefined}
     */
    function searchFilterSelectModal(val) {
      var x, i;
      x = ModalFilterSelectNode.querySelectorAll(".modal-body ul li label");
      for (i = 1; i < x.length; i++) {
        if (x[i].tagName == "LABEL") {
          if (x[i].title.toUpperCase().indexOf(val.toUpperCase()) == -1) {
            x[i].closest('li').style.display = "none";
          } else {
            x[i].closest('li').style.display = "block";
            const re = new RegExp(`${val.toUpperCase()}`, 'gi');
            x[i].innerHTML = x[i].title.replace(re, str => '<span class="highlight">' + str + "</span>");
          }
        }
      }
    }
  
    /**
     * Поиск в окне Настроить колонки с подсветкой найденной подстроки
     * @param {type} val
     * @returns {undefined}
     */
    function searchColumns(val, elementsForSearch) {
  
      var x, i;
      x = elementsForSearch;
      for (i = 0; i < x.length; i++) {
        if (x[i].tagName == "SPAN") {
          if (x[i].title.toUpperCase().indexOf(val.toUpperCase()) == -1) {
            x[i].closest('a.dTableColumn').style.cssText = `display:none!important`;
          } else {
            x[i].closest('a.dTableColumn').style.cssText = `display:flex!important`;
            const re = new RegExp(`${val.toUpperCase()}`, 'gi');
            x[i].innerHTML = x[i].title.replace(re, str => '<span class="highlight">' + str + "</span>");
          }
        }
      }
    }
  
    // Кнопка загрузки XLSX
    $(dTableDOMObject).on('click', '.btn-to-xls', function () {
  
      loadTableXLS();
  
      return false;
    });
    // --Кнопка загрузки XLS
  
    /**
     * Загрузка таблицы XLS
     * @returns {undefined}
     */
    async function loadTableXLS() {
  
      let loadTableMethodXLS = 'toXls';
  
      dTableXLS = JSON.parse(JSON.stringify(thisDTable.dTable)); // Простое присвоение для объекта приводит к присвоению ссыли на объект
      dTableXLS.page = "1";
      dTableXLS.page_row_count = 1000000;
  
      let response = await fetch(loadTableMethodUrlXls, {
        method: 'POST',
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify(dTableXLS)
      });
  
      if (response.status === 200) {
  
        let blob = await response.blob(); // скачиваем как Blob-объект
  
        const downloadUrl = window.URL.createObjectURL(blob);
  
        const link = document.createElement('a');
        link.href = downloadUrl;
  
        link.download = `${thisDTable.dTableTitle}.xlsx`;
  
        document.body.appendChild(link);
  
        link.click();
        link.remove();
  
        setTimeout(() => {
          // For Firefox it is necessary to delay revoking the ObjectURL.
          // https://bugzilla.mozilla.org/show_bug.cgi?id=1282407
          window.URL.revokeObjectURL(downloadUrl);
        }, 100);
  
        return true;
      } else {
        Message('Ошибка, файл не получен', 'warning');
      }
  
      const result = await response.json();
  
      // l(result)
  
    }

    /**
     * Обновить доп.скролл:
     * Задать ширину, Показать/Скрыть
     */
    function dTableScrollRefresh(dTableDOMObject){

      // Задать ширину
      let scrollWidth=$(dTableDOMObject).find('.table-responsive')[0].scrollWidth;
      
      let clientWidth=$(dTableDOMObject).find('.table-responsive')[0].clientWidth;
      
      $(dTableDOMObject).find('.dtable-scroll')[0].style.width=`${clientWidth}px`;
      $(dTableDOMObject).find('.dtable-scroll-inner')[0].style.width=`${scrollWidth}px`;
      // --Задать ширину

      // Показать/Скрыть доп.прокрутку

      // берем координаты доп.прокрутки
      let scrollDopTop = $(dTableDOMObject).find('.dtable-scroll')[0].getBoundingClientRect().top+window.pageYOffset;

      // берем координаты осн.прокрутки
      let scrollMainHeight=$(dTableDOMObject).find('.table-responsive')[0].scrollHeight
      let scrollMainTop = $(dTableDOMObject).find('.table-responsive')[0].getBoundingClientRect().top+window.pageYOffset;

      // l('scrollMainTop='+scrollMainTop+' scrollMainHeight='+scrollMainHeight+' scrollDopTop='+scrollDopTop)

      if(scrollDopTop>scrollMainTop && scrollDopTop<scrollMainTop+scrollMainHeight){
        // доп.прокрутка находится "внутри" таблицы
        $(dTableDOMObject).find('.dtable-scroll').css('height','auto');
      }else{
        $(dTableDOMObject).find('.dtable-scroll').css('height','0');
      }
      // --Показать/Скрыть доп.прокрутку
    }
  
  }