export const bg = {
  meta: {
    title: "MOLT Planner",
    description: "Операционна система за студиа за интериорен дизайн.",
  },

  nav: {
    home: "Начало",
    projects: "Проекти",
    newProject: "Нов проект",
    planner: "Планер",
    settings: "Настройки",
  },

  common: {
    brand: "MOLT Planner",
    brandTagline: "Студио OS",
    back: "Назад",
    continue: "Напред",
    close: "Затвори",
    open: "Отвори",
    empty: "—",
    step: "Стъпка",
    notStarted: "Не е започнато",
    complete: "Завършен",
    workflow: "Работен процес",
    projectFallback: "Проект",
    roomFallback: "Помещение",
    areaNotSet: "Площ не е зададена",
    areaNotSpecified: "Площ не е посочена",
    dateNotSet: "Не е зададена",
    handoverNotScheduled: "Предаване не е планирано",
    availableImmediately: "Незабавно",
    roomTemplateFallback: "Шаблон за помещения",
    perStudioWeek: "% от една студио седмица",
    hoursShort: "ч",
  },

  labels: {
    engagementStatus: {
      inquiry: "Запитване",
      active: "Активен",
      paused: "На пауза",
      completed: "Завършен",
      archived: "Архивиран",
    },
    projectPriority: {
      low: "Нисък",
      normal: "Нормален",
      high: "Висок",
      critical: "Критичен",
    },
    roomPriority: {
      low: "Нисък",
      normal: "Нормален",
      high: "Висок",
    },
    phaseKind: {
      discovery: "Проучване",
      concept: "Концепция",
      design_development: "Разработка на дизайна",
      documentation: "Документация",
      procurement: "Поръчки",
      installation: "Монтаж",
      styling: "Стилизация",
    },
    phaseStatus: {
      not_started: "Не е започнато",
      in_progress: "В процес",
      blocked: "Блокирано",
      completed: "Завършено",
    },
    taskKind: {
      site_visit: "Оглед на обект",
      client_presentation: "Презентация към клиент",
      design_work: "Дизайнерска работа",
      sourcing: "Подбор на материали",
      coordination: "Координация",
      review: "Преглед",
      admin: "Администрация",
      administration: "Администрация",
    },
    preferredChannel: {
      phone: "Телефон",
      email: "Имейл",
      viber: "Viber",
      whatsapp: "WhatsApp",
      in_person: "Среща на място",
    },
    projectCategory: {
      residential: "Жилищен",
      commercial: "Търговски",
    },
    projectObjectType: {
      apartment: "Апартамент",
      house: "Къща",
      penthouse: "Пентхаус",
      studio: "Студио",
      office: "Офис",
      restaurant: "Ресторант",
      hotel: "Хотел",
      clinic: "Клиника",
      fitness: "Фитнес",
      retail: "Търговски обект",
      beauty_salon: "Салон за красота",
      cafe: "Кафе",
      bar: "Бар",
      villa: "Вила",
      holiday_apartment: "Ваканционен апартамент",
      other: "Друго",
    },
    projectPackage: {
      interior: "Интериор",
      exterior: "Екстериор",
      interior_exterior: "Интериор + Екстериор",
      author_supervision: "Авторски надзор",
      complete_package: "Пълен пакет",
    },
    roomKind: {
      entrance: "Вход",
      hallway: "Коридор",
      open_living_area: "Отворена дневна",
      kitchen: "Кухня",
      dining_room: "Трапезария",
      master_bedroom: "Основна спалня",
      bedroom: "Спалня",
      kids_room: "Детска стая",
      guest_room: "Гостна стая",
      walk_in_closet: "Дрешник",
      bathroom: "Баня",
      wc: "WC",
      laundry: "Пералня",
      storage: "Склад",
      pantry: "Килер",
      office: "Офис",
      terrace: "Тераса",
      garage: "Гараж",
      basement: "Мазе",
      staircase: "Стълбище",
      reception: "Рецепция",
      lobby: "Лоби",
      meeting_room: "Зала за срещи",
      open_office: "Отворено офис пространство",
      kitchenette: "Кухненски ъгъл",
      server_room: "Сървърно помещение",
      restroom: "Санитарно помещение",
      restaurant: "Ресторант",
      bar: "Бар",
      hotel_room: "Хотелска стая",
      suite: "Апартамент",
      spa: "СПА",
      fitness: "Фитнес",
      medical_room: "Медицинско помещение",
      retail_area: "Търговска зона",
      waiting_area: "Зона за изчакване",
      technical_room: "Техническо помещение",
      other: "Друго",
    },
    waitingCategory: {
      client_approval: "Одобрение от клиент",
      blocked_phase: "Блокирана фаза",
      supplier_waiting: "Изчакване на доставчик",
    },
    scheduleFit: {
      green: "ПОДХОДЯЩ",
      yellow: "УМЕРЕН",
      red: "РИСКОВ",
    },
  },

  dashboard: {
    title: "Планиращо табло",
    subtitle:
      "Преглед на натоварването, оставащите часове по фази и кога екипът може да поеме следващ ангажимент.",
    activeProjects: "Активни проекти",
    emptyPipeline:
      "Няма проекти в pipeline-а. Създайте първия ангажимент, за да започнете планирането.",
    projectCount: (count: number) =>
      `${count} ${count === 1 ? "проект" : "проекта"} в pipeline-а на студиото.`,
  },

  actionCenter: {
    title: "Център за действия",
    subtitle: "Какво е следващо — работа, блокери и срокове на един екран.",
    continue: {
      openPhase: "Към фазата",
    },
    nextActions: {
      title: "Следващи действия",
      subtitle: "До 5 препоръки по приоритет.",
      empty: "Няма незавършени действия. Всички проекти са наред.",
    },
    waiting: {
      title: "Изчаква",
      subtitle: "Блокирани фази и паузирана работа.",
      empty: "Няма блокери или паузирани сесии.",
      blocked: "Блокирано",
      paused: "На пауза",
      pausedTitle: (phase: string) => `Паузирана работа · ${phase}`,
      pausedContext: (project: string, room: string) => `${project} · ${room}`,
    },
    deadlines: {
      title: "Предстоящи срокове",
      subtitle: "Подредени по най-близка дата.",
      empty: "Няма зададени срокове.",
      overdue: "Просрочено",
    },
    actions: {
      runningWork: "Работата продължава — върни се към сесията.",
      currentPhase: "Текущата фаза е в процес — продължи работата.",
      noStartedWork: "Работата по това помещение все още не е започната.",
      overduePhase: "Фазата е с изминал срок — нужно е внимание.",
      continueWork: "Продължи",
      startWork: "▶ Започни работа",
      openPhase: "Отвори фазата",
    },
  },

  studioWorkflow: {
    projectScope: "Проект",
    roomScope: "Помещение",
    projectContext: (projectName: string) => `Проект: ${projectName}`,
    projectWorkKind: {
      inquiry: "Запитване",
      offer: "Оферта",
      contract: "Договор",
      site_survey: "Оглед на обект",
      measurements: "Замервания",
      research: "Проучване",
      moodboard: "Мoodboard",
      budget_discussion: "Обсъждане на бюджет",
      client_presentation: "Клиентска презентация",
      procurement_coordination: "Координация на доставки",
      final_handover: "Финално предаване",
    },
    actions: {
      currentProject: "Проектната стъпка е в процес — продължи работата.",
      startProject: "Проектната стъпка все още не е започната.",
      overdueProject: "Проектната стъпка е с изминал срок — нужно е внимание.",
    },
    waiting: {
      projectBlocked: (projectName: string) =>
        `Изчаква одобрение · ${projectName}`,
    },
  },

  studioDashboard: {
    title: "Studio OS",
    subtitle: "Преглед на цялото студио — всеки проект на един ред.",
    summary: {
      activeProjects: "Активни проекти",
      inProgress: "В процес",
      inProgressHint: "Проекти с текуща работа",
      waiting: "Изчаква",
      waitingHint: "Клиент, доставчик или одобрение",
      overdue: "Просрочени",
      overdueHint: "Проекти с изминали срокове",
      ofTotal: (total: number) => `от ${total}`,
    },
    projects: {
      title: "Всички проекти",
      empty: "Няма проекти. Създайте първия ангажимент, за да започнете.",
    },
    projectStatus: {
      in_progress: "В процес",
      waiting: "Изчаква",
      overdue: "Просрочен",
      completed: "Завършен",
      active: "Активен",
      paused: "На пауза",
      inquiry: "Запитване",
    },
    roomTable: {
      room: "Помещение",
      currentPhase: "Текуща фаза",
      currentTask: "Текуща задача",
      status: "Статус",
      remaining: "Оставащи часове",
      progress: "Напредък",
      noCurrentTask: "—",
      noRemainingHours: "0ч",
      remainingHours: (hours: number) => `${hours}ч`,
    },
  },

  today: {
    title: "Днес",
    subtitle: (count: number) =>
      `${count} активен ${count === 1 ? "ангажимент" : "ангажимента"} · фокус върху днешния план и блокерите`,
    nextTask: {
      title: "Следваща задача",
      subtitle: "Най-приоритетната работа за днес в студиото",
      emptyTitle: "Няма планирана работа днес",
      emptyDescription:
        "Няма задачи в днешния план. Отворете проект, за да видите контекста и да планирате работа.",
      openProject: "Към проекта",
      hours: (hours: number) => `${hours}ч`,
    },
    waiting: {
      title: "Изчакване",
      subtitle: "Решения, блокери и зависимости в активните проекти",
      emptyTitle: "Няма изчакване",
      emptyDescription:
        "Няма одобрения от клиент, блокирани фази или изчакване на доставчици.",
    },
    capacity: {
      title: "Капацитет днес",
      planned: "Планирани часове",
      available: "Свободен капацитет",
      dailyLimit: "Дневен лимит",
      loadLabel: (percent: number) => `${percent}% от дневния капацитет`,
      overCapacity: "Студиото е над дневния капацитет",
      studioRemaining: (hours: number) => `${hours}ч остават в активните фази`,
    },
  },

  capacity: {
    title: "Планиране на капацитет",
    subtitle: (count: number) =>
      `Оставащо натоварване от незавършени фази в ${count} активен ${count === 1 ? "проект" : "проекта"}.`,
    remainingWorkload: "Оставащо натоварване",
    remainingHours: "Оставащи часове",
    weeklyCapacity: "Седмичен капацитет",
    estimatedCompletion: "Очаквано завършване",
    nextProjectStart: "Старт на следващ проект",
    remainingHoursLabel: (hours: number) =>
      `${hours}ч остават в активните проекти`,
    weeklyCapacityLabel: (hours: number) =>
      `${hours}ч капацитет на студиото седмично`,
    workloadComplete: "Текущото натоварване е завършено",
    availableImmediately: "Свободен за незабавен старт",
    allPhasesComplete: "Всички активни часове по фази са завършени",
    earliestNewEngagement:
      "Най-ранна дата, на която студиото може да поеме нов ангажимент",
    bandwidthOpen: "Капацитетът на студиото е свободен за нов ангажимент",
    studioWeekDetail: (weeks: number, days: number) =>
      `${formatWeeksInline(weeks)} · ${formatWorkingDaysInline(days)}`,
  },

  projects: {
    title: "Проекти",
    subtitle: "Всички активни ангажименти в студиото.",
    newTitle: "Нов проект",
    newSubtitle:
      "Създайте пълен ангажимент за интериорен дизайн в един воден процес.",
    newLink: "Нов проект",
    table: {
      project: "Проект",
      projectNumber: "№",
      client: "Клиент",
      classification: "Класификация",
      type: "Тип",
      area: "Площ",
      status: "Статус",
      created: "Създаден",
      actions: "Действия",
      emptyTitle: "Все още няма активни проекти",
      emptyDescription:
        "Стартирайте pipeline-а, като създадете първия проект с помещения и фази.",
    },
    actions: {
      open: "Отвори",
      view: "Преглед на проект",
      archive: "Архивирай проект",
      openMenu: "Действия по проект",
      archivedToast: "Проектът е архивиран успешно.",
    },
    wizard: {
      title: "Създаване на проект",
      subtitle:
        "Настройте ангажимент с клиент, детайли по проекта, помещения и стандартни фази в един процес.",
      steps: {
        client: "Клиент",
        project: "Проект",
        rooms: "Помещения",
        review: "Преглед",
      },
      existingClient: "Съществуващ клиент",
      existingClientHint: "Свържете проекта с клиент, вече в системата.",
      newClient: "Нов клиент",
      newClientHint: "Въведете информация за клиента преди създаване.",
      selectClient: "Изберете клиент",
      chooseClient: "Изберете клиент",
      clientName: "Име на клиент",
      clientNamePlaceholder: "Резиденция Харпър",
      preferredChannel: "Предпочитана комуникация",
      clientContacts: "Контакти на клиента",
      contactPhone: "Телефон",
      contactEmail: "Имейл",
      contactViber: "Viber",
      contactWhatsapp: "WhatsApp",
      secondaryContact: "Втори контакт (по избор)",
      clientInsights: "Профил на клиента",
      clientInsightsDescription:
        "Тази информация помага на студиото да персонализира комуникацията и решенията по проекта.",
      clientInsightsPlaceholder:
        "• Обича естествени материали\n• Има две деца\n• Иска актуализации след всяка фаза\n• Първи път работи с интериорен дизайнер\n• Обича скандинавски интериори\n• Предпочита топло осветление\n• Не харесва индустриален стил",
      projectNumber: "Номер на проект",
      category: "Категория",
      objectType: "Тип обект",
      package: "Пакет",
      designDeadline: "Краен срок — дизайн",
      executionDeadline: "Краен срок — изпълнение",
      moveInDate: "Дата на нанасяне / от opening",
      duplicateRoom: "Дублирай",
      deleteRoom: "Изтрий",
      moveRoomUp: "Нагоре",
      moveRoomDown: "Надолу",
      addRoom: "Добави помещение",
      projectName: "Име на проект",
      projectNamePlaceholder: "Резиденция Ривърдейл",
      selectCategory: "Изберете категория",
      selectObjectType: "Изберете тип обект",
      selectPackage: "Изберете пакет",
      priority: "Приоритет",
      selectPriority: "Изберете приоритет",
      siteAddress: "Адрес на обект",
      siteAddressPlaceholder: "Улица, град и бележки за достъп",
      siteArea: "Площ (квадратни метри)",
      siteAreaPlaceholder: "180",
      loadTemplateDefaults: "Зареди шаблона по подразбиране",
      addCustomRoom: "Добави помещение",
      templateRooms: "Помещения от шаблон",
      selectedRooms: (count: number) => `Избрани помещения (${count})`,
      selectRoomToContinue: "Изберете поне едно помещение, за да продължите.",
      templateRoom: "Помещение от шаблон",
      customRoom: "Персонализирано помещение",
      removeRoom: "Премахни помещение",
      roomName: "Име на помещение",
      roomType: "Тип помещение",
      defaultRoomsFor: (type: string) => `Стандартни помещения за ${type} проекти.`,
      review: {
        client: "Клиент",
        project: "Проект",
        roomsPhases: "Помещения и фази",
        name: "Име",
        type: "Тип",
        classification: "Класификация",
        address: "Адрес",
        area: "Площ",
        roomsCreated: (rooms: number, phases: number) =>
          `${rooms} ${rooms === 1 ? "помещение" : "помещения"} ще бъдат създадени с ${phases} стандартни фази всяко.`,
      },
      creating: "Създаване на проект...",
      create: "Създай проект",
      toasts: {
        selectClient: "Изберете клиент, за да продължите.",
        clientNameRequired: "Въведете име на клиент, за да продължите.",
        projectNameRequired: "Въведете име на проект, за да продължите.",
        selectRoom: "Изберете поне едно помещение, за да продължите.",
        roomNameRequired: "Всяко избрано помещение трябва да има име.",
        created: "Проектът е създаден успешно.",
      },
    },
    workspace: {
      backToDashboard: "Към таблото",
      backToProject: (name: string) => `Към ${name}`,
      priorityLabel: (priority: string) => `${priority} приоритет`,
      client: "Клиент",
      area: "Площ",
      engagement: "Ангажимент",
      targetHandover: "Целева дата за предаване",
      progress: {
        title: "Напредък",
        subtitle: "Състояние на ангажимента и натоварването на студиото.",
        overall: "Общ напредък",
        criticalPhase: "Критична фаза",
        remainingHours: "Оставащи часове по фази",
        capacityToday: "Влияние върху капацитета днес",
        estimatedCompletion: (label: string) =>
          `Очаквано завършване на проекта: ${label}`,
        scheduledToday: (hours: number, percent: number) =>
          `${hours}ч планирани · ${percent}% от студио деня`,
      },
      rooms: {
        title: "Помещения",
        subtitle: "Преглед на напредъка по всяко помещение в проекта.",
        focusRoom: (name: string) => `Фокус: ${name}`,
        focusBadge: "Фокус",
        openRoom: "Отвори →",
        remainingHours: (hours: number) => `${hours}ч остават`,
        currentPhase: "Текуща фаза",
        nextPhase: "Следваща",
        timelineTitle: "Фази",
        progress: "Напредък",
        status: "Статус",
        noNextPhase: "—",
      },
      context: {
        title: "Контекст за проекта",
        todayCount: (count: number) =>
          `${count} ${count === 1 ? "задача" : "задачи"} днес`,
        waitingCount: (count: number) =>
          `${count} ${count === 1 ? "блокер" : "блокера"}`,
      },
      today: {
        title: "Днес",
        subtitle: "Работа, планирана за този проект днес.",
        emptyTitle: "Няма планирана работа днес",
        emptyDescription:
          "Проектът няма задачи в днешния план. Планирайте работа от таблото, когато добавите задачи.",
      },
      waiting: {
        title: "Изчакване",
        subtitle: "Решения, блокери и зависимости, които забавят проекта.",
        emptyTitle: "Няма изчакване",
        emptyDescription:
          "Няма одобрения от клиент, блокирани фази или изчакване на доставчици.",
      },
    },
  },

  intake: {
    title: "Планер",
    subtitle:
      "Симулирайте нов проект спрямо текущото натоварване, преди да създадете записи в системата.",
    link: "Планер",
    backToDashboard: "Към планиращото табло",
    cardTitle: "Планер за нов ангажимент",
    cardSubtitle:
      "Оценете часове, продължителност и съвместимост с графика, преди да създадете записи.",
    proceedToCreation: "Към създаване на проект",
    steps: {
      type: "Тип проект",
      scope: "Обхват",
      estimate: "Оценка",
      scheduleFit: "Съвместимост",
    },
    type: {
      prompt: "Изберете типа ангажимент за моделиране",
      fallbackDescription: (type: string) =>
        `Оценка на натоварването за ${type.toLowerCase()} ангажимент.`,
    },
    scope: {
      manual: "Ръчна оценка",
      manualHint: "Въведете площ и приблизителен брой помещения.",
      template: "Шаблон за помещения",
      templateHint: (type: string) =>
        `Изберете помещения от шаблона за ${type} проекти.`,
      siteArea: "Площ на обект (квадратни метри)",
      roomCount: "Приблизителен брой помещения",
      roomCountHint:
        "Всяко помещение се моделира с пълния седемфазен процес и стандартни часове.",
      templateRooms: "Помещения от шаблон",
      noTemplate: "Няма наличен шаблон за този тип проект.",
    },
    estimate: {
      title: (type: string) => `Оценка: ${type}`,
      hours: "Очаквани часове",
      duration: "Очаквана продължителност",
      earliestStart: "Най-ранен свободен старт",
      completion: "Очаквано завършване",
      roomDetail: (count: number) =>
        `${count} ${count === 1 ? "помещение" : "помещения"} × пълен работен процес`,
      durationHint: "На база седмичния капацитет на студиото",
      startHint: "Последователен старт след текущото активно натоварване",
      completionHint: "Целева дата за завършване на симулацията",
    },
    comparison: {
      currentWorkload: "Текущо натоварване",
      afterAdding: "След добавяне на проекта",
      parallelImpact: "Ефект при паралелен старт",
      recommendedStart: "Препоръчителен старт",
      activeProjectsBacklog: (projects: number, weeks: number) =>
        `${projects} активен ${projects === 1 ? "проект" : "проекта"} · ${formatWeeksInline(weeks)} backlog`,
      pipelineWeeks: (weeks: number) => `${formatWeeksInline(weeks)} pipeline`,
      noDelay: "Без забавяне",
      delayWeeks: (weeks: number) =>
        `+${weeks} ${weeks === 1 ? "седмица" : "седмици"}`,
      parallelSlip:
        "Очаквано забавяне на активните проекти при незабавен старт",
      sequentialPreserves:
        "Последователният старт запазва графика на текущите проекти",
      earliestSlot: "Най-ранен слот без забавяне на активната работа",
      simulationNote:
        "Това е само симулация. Няма създадени клиенти, проекти или помещения, докато не преминете към създаване.",
      createProject: "Създай проект",
      backToDashboard: "Към таблото",
    },
    toasts: {
      roomRequired: "Въведете поне едно помещение, за да продължите.",
      templateRoomRequired:
        "Изберете поне едно помещение от шаблона, за да продължите.",
    },
    scopeSummary: {
      roomsAndArea: (rooms: number, area: string) =>
        `${rooms} ${rooms === 1 ? "помещение" : "помещения"} · ${area}`,
    },
  },

  room: {
    progress: "Напредък на помещението",
    projectLabel: "Проект",
    remainingHours: "Оставащи часове",
    currentPhase: "Текуща фаза",
    pipelineTitle: "Работен процес",
    pipelineSubtitle:
      "Фази на интериорния дизайн за това помещение — от проучване до стилизация.",
    phaseStep: (step: number, total: number) => `Фаза ${step} / ${total}`,
    phaseDetailHint: "Задачи и детайли ще бъдат добавени тук.",
    current: "Текуща",
    logged: "Отчетени",
    estimated: "Очаквани",
    completePhase: (label: string) => `Завърши ${label}`,
    completing: "Завършване...",
    phaseCompleteToast: (label: string) =>
      `${label} е маркирана като завършена. Капацитетът е актуализиран.`,
  },

  workSession: {
    start: "▶ Започни работа",
    runningLabel: "🟢 Работиш в момента",
    pausedLabel: "⏸ На пауза",
    pause: "⏸ Пауза",
    resume: "▶ Продължи",
    finish: "✅ Приключи",
    complete: "Приключи",
    completing: "Приключване...",
    cancel: "Отказ",
    otherSessionActive: "Вече има активна работна сесия.",
    completeDialogTitle: "Приключване на работна сесия",
    completeDialogDescription:
      "Опишете какво свършихте и какво следва, преди да затворите сесията.",
    fields: {
      completedWork: "Какво свърши?",
      nextStep: "Следваща стъпка",
      blocker: "Има ли проблем?",
    },
    dashboardTitle: "Работиш в момента",
    dashboardProject: "Проект",
    dashboardRoom: "Помещение",
    dashboardPhase: "Фаза",
    goToProject: "Отиди към проекта",
    startSuccess: "Работната сесия е стартирана.",
    pauseSuccess: "Работната сесия е на пауза.",
    resumeSuccess: "Работната сесия е възобновена.",
    completeSuccess: "Работната сесия е приключена.",
  },

  workSessionLog: {
    todayTitle: "Днес",
    todaySubtitle: "Приключени и активни работни сесии за деня.",
    empty: "Днес няма записана работа.",
    summaryTitle: "Общо днес",
    summaryTotal: "Общо",
    completedCount: (count: number) =>
      `${count} ${count === 1 ? "приключена" : "приключени"}`,
    runningCount: (count: number) =>
      `${count} ${count === 1 ? "активна" : "активни"}`,
    runningNow: "активна",
    historyTitle: "История",
  },

  continueWorking: {
    title: "Продължи работа",
    runningLabel: "🟢 Работиш в момента",
    lastWorkedLabel: "Последно работи по",
    lastNote: "Последна бележка",
    lastNextStep: "Следваща стъпка",
    timeWorked: "Работено време",
    continue: "Продължи",
    finish: "Приключи",
    startWork: "▶ Продължи работа",
    emptyMessage: "Все още нямаш започната работа.",
    newProject: "Нов проект",
  },

  progress: {
    dashboardTitle: "Напредък на студиото",
    dashboardSubtitle: "Автоматично изчислен от завършени фази и помещения.",
    overallProgress: "Общ напредък",
    projectsInProgress: "Проекти в процес",
    roomsCompletedToday: "Помещения завършени днес",
    hoursWorkedToday: "Работени часове днес",
    projectLabel: "Проект",
    projectCompleted: "Проектът е завършен",
    roomCompleted: "Завършено",
    phaseCount: (completed: number, total: number) =>
      `${completed} / ${total} ${total === 1 ? "фаза" : "фази"}`,
    roomCount: (completed: number, total: number) =>
      `${completed} / ${total} ${total === 1 ? "помещение" : "помещения"}`,
  },

  settings: {
    title: "Настройки",
    subtitle: "Конфигурация на студиото и предпочитания за планиране.",
    placeholder:
      "Настройките ще бъдат налични в следващите версии. Засега капацитетът и шаблоните се управляват от кода.",
  },

  validation: {
    projectNameRequired: "Името на проекта е задължително",
    categoryRequired: "Изберете категория",
    objectTypeRequired: "Изберете тип обект",
    packageRequired: "Изберете пакет",
    dateInvalid: "Въведете валидна дата (ГГГГ-ММ-ДД)",
    clientRequired: "Изберете клиент",
    clientNameRequired: "Името на клиента е задължително",
    roomNameRequired: "Името на помещението е задължително",
    roomTypeRequired: "Изберете тип помещение",
    roomSelectionRequired: "Изберете поне едно помещение за проекта",
    areaPositive: "Площта трябва да е по-голяма от нула",
    emailInvalid: "Въведете валиден имейл адрес",
    projectIdInvalid: "Невалиден идентификатор на проект",
    clientIdInvalid: "Невалиден идентификатор на клиент",
    phaseIdInvalid: "Невалиден идентификатор на фаза",
    roomIdInvalid: "Невалиден идентификатор на помещение",
    failed: "Валидацията не мина",
  },

  errors: {
    createProject: "Възникна грешка при създаване на проекта.",
    archiveProject: "Архивирането на проекта не успя.",
    completePhase: "Завършването на фазата не успя.",
    intakeSimulation: "Симулацията в планера не успя.",
    loadClients: "Зареждането на клиентите не успе.",
  },

  workspaceMessages: {
    criticalPhase: {
      blocked: (phase: string) => `${phase} — блокирана`,
      blockedContext: (room: string) =>
        `${room} изисква внимание, преди работата да продължи.`,
      inProgress: (phase: string) => `${phase} — в процес`,
      inProgressContext: (room: string) =>
        `Фокусната работа е в ${room}.`,
      rampingUp: "Процесът набира скорост",
      noBlockers: "Няма критични блокери в помещенията на проекта.",
    },
    waiting: {
      phaseBlocked: (phase: string) => `${phase} е блокирана`,
      categoryHolding: (category: string, room: string) =>
        `${category} забавя ${room}.`,
      taskWaiting: (task: string, room: string) =>
        `${task} изчаква в ${room}.`,
    },
    capacityImpact: {
      none: "Няма планирано студио време за този проект днес.",
      fillsDay: "Проектът запълва днешния капацитет на студиото.",
      heavy: "Проектът значително натоварва днешния план.",
      moderate: "Проектът има умерено присъствие в днешния план.",
    },
    todayStatus: {
      inProgress: "В процес",
      scheduled: "Планирано",
      planned: "В план",
    },
  },

  scheduleFitMessages: {
    green: {
      headline: "Проектът пасва на текущия график",
      detailWithWorkload:
        "Ангажиментът може да започне последователно след активната работа, без да забавя текущите проекти.",
      detailOpen: "Капацитетът на студиото е свободен за този ангажимент.",
    },
    yellow: {
      headline: "Проектът създава умерено претоварване",
      parallelDetail: (weeks: number) =>
        `Паралелен старт би добавил ${weeks} ${weeks === 1 ? "студио седмица" : "студио седмици"} към графика на активните проекти. Последователният старт намалява натиска.`,
      largeProject:
        "Голям ангажимент спрямо седмичния капацитет. Планирайте последователен старт и следете дължината на pipeline-а.",
      pipelineDetail: (weeks: number) =>
        `Pipeline-ът на студиото ще нарасне до ${weeks} ${weeks === 1 ? "седмица" : "седмици"} с този ангажимент.`,
    },
    red: {
      headline: "Проектът забавя съществуващите проекти",
      parallelDetail: (weeks: number) =>
        `Паралелен старт би удължил доставката на активни проекти с приблизително ${weeks} ${weeks === 1 ? "студио седмица" : "студио седмици"}.`,
      pipelineDetail: (weeks: number) =>
        `Общият pipeline на студиото ще достигне ${weeks} седмици — над устойчивия капацитет за активни ангажименти.`,
    },
  },

  roomTemplates: {
    residential: {
      name: "Жилищен проект",
      description: "Пълен набор помещения за жилищен интериорен дизайн.",
      defaultRoomSummary: "Планиране и дизайн на помещението",
      rooms: {
        "living-room": {
          name: "Дневна",
          summary: "Основно жилищно и представително пространство",
        },
        kitchen: {
          name: "Кухня",
          summary: "Оформление, кухненски мебели и материали",
        },
        "master-bedroom": {
          name: "Основна спалня",
          summary: "Дизайн на спалня и планиране на гардероб",
        },
        bathroom: {
          name: "Баня",
          summary: "Sanitaryware и финиши за основна баня",
        },
        "home-office": {
          name: "Домашен офис",
          summary: "Планиране на работно пространство у дома",
        },
      },
    },
    commercial: {
      name: "Търговски проект",
      description: "Пълен набор помещения за търговски и hospitality пространства.",
      defaultRoomSummary: "Планиране и дизайн на зоната",
      rooms: {
        reception: {
          name: "Рецепция",
          summary: "Клиентска рецепция и зона за изчакване",
        },
        "open-office": {
          name: "Отворено офис пространство",
          summary: "Работни места и план на бюра",
        },
        "meeting-room": {
          name: "Зала за срещи",
          summary: "Пространство за съвместна работа и презентации",
        },
        bathroom: {
          name: "Баня",
          summary: "Финиши за санитарни помещения за персонал",
        },
      },
    },
    hospitality: {
      name: "Хотелиерско изживяване",
      description: "Гостоприемни зони за хотелиерски проекти.",
      rooms: {
        lobby: {
          name: "Лоби",
          summary: "Първо впечатление и гостна циркулация",
        },
        "guest-room": {
          name: "Гостна стая",
          summary: "Прототипен дизайн на гостна стая",
        },
        restaurant: {
          name: "Ресторант",
          summary: "Атмосфера и план на местата",
        },
        bathroom: {
          name: "Баня",
          summary: "Стандарти за гостни бани",
        },
      },
    },
    renovation: {
      name: "Ремонт — основни зони",
      description: "Фокусиран набор помещения за ремонтни ангажименти.",
      rooms: {
        "living-room": {
          name: "Дневна",
          summary: "Ремонтирано жилищно пространство",
        },
        kitchen: {
          name: "Кухня",
          summary: "Обхват на ремонт на кухня",
        },
        bathroom: {
          name: "Баня",
          summary: "Обхват на ремонт на баня",
        },
      },
    },
    staging: {
      name: "Сценичен staging",
      description: "Помещения, типични за staging на имоти.",
      rooms: {
        "living-room": {
          name: "Дневна",
          summary: "Основно представително пространство",
        },
        bedroom: {
          name: "Спалня",
          summary: "Staging и стилизация на спалня",
        },
        kitchen: {
          name: "Кухня",
          summary: "Акценти за staging на кухня",
        },
      },
    },
  },
} as const;

function formatWeeksInline(weeks: number) {
  return `${weeks} ${weeks === 1 ? "студио седмица" : "студио седмици"}`;
}

function formatWorkingDaysInline(days: number) {
  return `${days} ${days === 1 ? "работен ден" : "работни дни"}`;
}

export type BgDictionary = typeof bg;
